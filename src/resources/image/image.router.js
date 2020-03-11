import { Router } from 'express'
import cloudinary from 'cloudinary'
const router = Router()

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret
})

// /api/image
router.route('/').delete((req, res) => {
  console.log(req.body)
  cloudinary.v2.api.delete_resources([req.body.public_id], function(
    error,
    result
  ) {
    console.log(result, error)
  })
})

export default router
