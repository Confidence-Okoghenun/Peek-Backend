import { Router } from 'express'
import controllers from './note.controllers'

const router = Router()

// /api/note
router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne, controllers.setReminder)

// /api/note/:id
router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne, controllers.setReminder)
  .delete(controllers.removeOne)

export default router
