import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    sId: String,
    provider: String,
    profileImageURL: String
  },
  { timestamps: true }
)

export const User = mongoose.model('user', userSchema)
