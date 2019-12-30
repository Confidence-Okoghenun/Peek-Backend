import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: String,
    googleId: String,
    profileImageURL: String
  },
  { timestamps: true }
)

export const User = mongoose.model('user', userSchema)
