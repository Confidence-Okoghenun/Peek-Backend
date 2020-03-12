import { Router } from 'express'
import cloudinary from 'cloudinary'
const router = Router()

cloudinary.config({
  api_key: process.env.cloudinary_api_key,
  cloud_name: process.env.cloudinary_cloud_name,
  api_secret: process.env.cloudinary_api_secret
})

// /api/image
router.route('/').delete((req, res) => {
  try {
    cloudinary.v2.api.delete_resources([req.body.public_id], function(
      error,
      result
    ) {
      if (error) {
        res.status(402).send({ data: error })
      } else {
        res.status(200).json({ data: result })
      }
    })
  } catch (e) {
    console.error(e)
    res.end()
  }
})

export default router
