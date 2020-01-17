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

  console.log('fired reminder for ' + note._id)
  const payload = JSON.stringify({
    title: note.title || note.body || 'Reminder'
  })

  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err))

  // await User.remove({lastLogIn: {$lt: twoDaysAgo}});
})

export default {
  ...crudControllers(Note),
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
  async updateOne(req, res) {
    try {
      const { subscription, clientNow } = req.body
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

      await agenda.start()
      // const now = moment().format('YYYY-MM-DDTHH:mm:ss')
      // const date = moment(updatedDoc.due).format('YYYY-MM-DDTHH:mm:ss')

      const now = moment(clientNow).format()
      const date = moment(updatedDoc.due).format()

      // const now = moment.utc().local().toISOString()
      // const date = moment(updatedDoc.due).format()

      console.log('## now: ' + now)
      console.log('## date: ' + date)

      if (moment(date).isSameOrAfter(now)) {
        console.log('## setting agenda for date: ' + date)
        await agenda.schedule(date, 'send reminders', {
          note: updatedDoc,
          subscription
        })
      } else {
        console.log('## date is in the past')
      }

      res.status(200).json({ data: updatedDoc })
    } catch (e) {
      console.error(e)
      res.status(400).end()
    }
  }
}
console.log(config.dbUrl)
