import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    pinned: {
      type: Boolean,
      required: true,
      enum: [true, false],
      default: false
    },
    content: String,
    due: Date,
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

noteSchema.index({ user: 1, name: 1 }, { unique: true })

export const Note = mongoose.model('note', noteSchema)
