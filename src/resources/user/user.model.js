import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: String,
    socialId: String,
    provider: String,
    profileImageURL: String
  },
  { timestamps: true }
)

export const User = mongoose.model('user', userSchema)
