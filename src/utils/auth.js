import passport from 'passport'
import { pick, keys, isEqual } from 'lodash'
import { Router } from 'express'
import FacebookTokenStrategy from 'passport-facebook-token'
import { Strategy as GoogleTokenStrategy } from 'passport-google-token'

import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'
import { Note } from '../resources/note/note.model'
import moment from 'moment'

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const socialCB = async (accessToken, refreshToken, profile, done) => {
  try {
    // console.log(profile)
    const Profile = {
      name: profile._json.name,
      sId: profile.id,
      provider: profile.provider,
      email: profile.emails ? profile.emails[0].value : 'no_email',
      profileImageURL:
        profile.provider === 'facebook'
          ? profile.photos[0].value
          : profile.provider === 'google'
          ? profile._json.picture
          : 'no_image'
    }
    const user = await User.findOne({ sId: Profile.sId }).exec()

    if (!user) {
      const newUser = await User.create(Profile)
      console.log('## created new user')

      const welcomeNote = {
        title: 'Welcome to Peeker! 🎉🎉🎉',
        label: ['cool label 😎'],
        color: '#a7feeb',
        content:
          "So what can you do with Peeker?<div>Well a lot 😜. You can take notes and group them with labels, archive or trash notes when you feel like, pin notes (like this one), perform deep search on notes, set reminders and receive push notification.</div><br><div>Wooh! That's a lot!</div><div>Guess what? You can install Peeker and work even faster⚡(check the side menu for this).</div><div><br></div><div>Other great features are coming in the next release, stay tuned!</div><div>🔥🔥🔥<br></div>",
        pinned: true,
        status: 'note',
        due: moment().format(),
        createdBy: newUser._id
      }

      await Note.create(welcomeNote)
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
      ).exec()
      console.log('## updated user')
      return done(null, updatedUser)
    }
    console.log('## found user')
    return done(null, user)
  } catch (e) {
    console.log(e)
  }
}

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.google_client_id,
      clientSecret: process.env.google_client_secret
    },
    socialCB
  )
)
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.facebook_client_id,
      clientSecret: process.env.facebook_client_secret
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

router.post('/', (req, res) => {
  res.json({ ok: true })
})

router.post(
  '/google',
  passport.authenticate('google-token', { session: false }),
  (req, res) => {
    const token = newToken(req.user)
    console.log('## sending user token to client')

    return res.status(201).send({ token })
  }
)

router.post(
  '/facebook',
  passport.authenticate('facebook-token', { session: false }),
  (req, res) => {
    const token = newToken(req.user)
    console.log('## sending user token to client')

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
