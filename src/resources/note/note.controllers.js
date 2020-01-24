import { crudControllers } from '../../utils/crud'
import { Note } from './note.model'
import config from '../../config'
import Agenda from 'agenda'
import _ from 'lodash'
import moment from 'moment'
import webpush from 'web-push'

const agenda = new Agenda({
  db: {
    address: config.dbUrl,
    options: {}
  }
})

agenda.define('send reminders', async job => {
  const { note, subscription } = job.attrs.data
  console.log('## fired reminder for ' + note._id)

  const payload = JSON.stringify({
    title: note.title.replace(/<\/?[^>]+(>|$)/g, ""),
    body: note.content.replace(/<\/?[^>]+(>|$)/g, ""),
    time: moment(note.due).format('MMMM Do YYYY, h:mm a')
  })

  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err))
})

export default {
  ...crudControllers(Note),
  async createOne(req, res, next) {
    try {
      const reminder = _.pick(req.body, ['subscription', 'clientNow'])
      req.body = _.omit(req.body, ['subscription', 'clientNow'])
      const createdBy = req.user._id

      const doc = await Note.create({ ...req.body, createdBy })

      reminder.note = doc
      req.reminder = reminder

      res.status(201).json({ data: doc })
      return next()
    } catch (e) {
      console.error(e)
      res.status(400).end()
    }
  },
  async getMany(req, res) {
    try {
      const docs = await Note.find({ createdBy: req.user._id })
        .lean()
        .exec()
      res.status(200).json({ data: docs.reverse() })
    } catch (e) {
      console.error(e)
      res.status(400).end()
    }
  },
  async updateOne(req, res, next) {
    try {
      const reminder = _.pick(req.body, ['subscription', 'clientNow'])
      req.body = _.omit(req.body, ['subscription', 'clientNow'])

      const updatedDoc = await Note.findOneAndUpdate(
        {
          createdBy: req.user._id,
          _id: req.params.id
        },
        req.body,
        { new: true }
      )
        .lean()
        .exec()

      if (!updatedDoc) {
        return res.status(400).end()
      }

      reminder.note = updatedDoc
      req.reminder = reminder

      res.status(200).json({
        data: updatedDoc
      })
      return next()
    } catch (e) {
      console.error(e)
      res.status(400).end()
    }
  },

  async setReminder(req, res) {
    try {
      const { note, clientNow, subscription } = req.reminder

      if (note.due && subscription) {
        await agenda.start()
        const now = clientNow
        const date = note.due

        if (moment(date).isSameOrAfter(now)) {
          console.log('## setting agenda for date: ' + date)
          await agenda.schedule(date, 'send reminders', {
            note,
            subscription
          })
        } else {
          console.log('## date is in the past')
        }
      } else {
        console.log('## could not set reminder')
      }
      res.end()
    } catch (e) {
      console.error(e)
      res.end()
    }
  }
}

// console.log(unescape('&amp;lt;mark&amp;gt;true&amp;lt;/mark&amp;gt;'))
