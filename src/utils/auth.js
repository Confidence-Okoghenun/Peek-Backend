import passport from 'passport'
import { pick, keys, isEqual } from 'lodash'
import { Router } from 'express'
import GooglStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'

import config from '../config'
import {
  google_client_id,
  google_client_secret,
  facebook_client_id,
  facebook_client_secret
} from '../config/keys'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

const socialCB = async (accessToken, refreshToken, profile, done) => {
  try {
    console.log(profile)
    const Profile = {
      name: profile._json.name,
      sId: profile.id,
      provider: profile.provider,
      email: profile.emails ? profile.emails[0].value : 'no_email',
      profileImageURL: profile.photos ? profile.photos[0].value : 'no_image'
    }
    const user = await User.findOne({ sId: Profile.sId })
      .lean()
      .exec()

    if (!user) {
      const newUser = await User.create(Profile)
      return done(null, newUser)
    }
    const oldProfile = pick(
      user,
      keys({
        name: null,
        sId: null,
        provider: null,
        email: null,
        profileImageURL: null
      })
    )
    // Update user if profile info has changed
    if (!isEqual(Profile, oldProfile)) {
      const updatedUser = await User.findOneAndUpdate(
        { sId: Profile.sId },
        Profile,
        { new: true }
      )
        .lean()
        .exec()
      return done(null, updatedUser)
    }

    return done(null, user)
  } catch (e) {
    console.log(e)
  }
}

passport.use(
  new GooglStrategy(
    {
      clientID: google_client_id,
      clientSecret: google_client_secret,
      callbackURL: '/signin/google/redirect'
    },
    socialCB
  )
)
passport.use(
  new FacebookStrategy(
    {
      clientID: facebook_client_id,
      clientSecret: facebook_client_secret,
      callbackURL: '/signin/facebook/redirect'
    },
    socialCB
  )
)

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

const router = Router()

router.get(
  '/google/',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }),
  (req, res) => {
    res.json({ ok: true })
  }
)

router.get(
  '/google/redirect',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = newToken(req.user)
    return res.status(201).send({ token })
  }
)
router.get('/facebook/', passport.authenticate('facebook'), (req, res) => {
  res.json({ ok: true })
})

router.get(
  '/facebook/redirect',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = newToken(req.user)
    return res.status(201).send({ token })
  }
)

export { router as signin }

export const protect = async (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).end()
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch (e) {
    return res.status(401).end()
  }

  const user = await User.findById(payload.id)
    .lean()
    .exec()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}
