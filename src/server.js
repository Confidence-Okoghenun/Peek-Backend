import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

import config from './config'
import { connect } from './utils/db'
import userRouter from './resources/user/user.router'
import noteRouter from './resources/note/note.router'
import { signin, protect } from './utils/auth'
import passport from 'passport'
import webpush from 'web-push'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(passport.initialize())
webpush.setVapidDetails(
  'mailto:test@test.com',
  process.env.webPush_publicKey,
  process.env.webPush_privateKey
)

// Test if server is running
app.get('/', (req, res) => {
  res.json({ ok: true })
})
app.use('/signin', signin)
app.use('/api', protect)
app.use('/api/user', userRouter)
app.use('/api/note', noteRouter)

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () => {
      console.log(`REST API on http://localhost:${config.port}/api`)
    })
  } catch (e) {
    console.error(e)
  }
}
