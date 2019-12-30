import passport from 'passport'
import { Router } from 'express'
import GooglStrategy from 'passport-google-oauth20'

import config from '../config'
import { client_id, client_secret } from '../config/keys'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

passport.use(
  new GooglStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: '/signin/google/redirect'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile._json.sub }).exec()
        if (!user) {
          const newUser = await User.create({
            name: profile._json.name,
            googleId: profile._json.sub,
            profileImageURL: profile._json.picture
          })
          return done(null, newUser)
        }
        return done(null, user)
      } catch (e) {
        console.log(e)
      }
    }
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
  '/',
  passport.authenticate('google', {
    scope: ['profile']
  }),
  (req, res) => {
    res.json({ ok: true })
  }
)

router.get(
  '/redirect',
  passport.authenticate('google', { session: false }),
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
