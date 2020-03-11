import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ''
    },
    image: [],
    label: [
      {
        type: String,
        trim: true,
        maxlength: 20,
        lowercase: true,
        default: ''
      }
    ],
    content: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#fff'
    },
    pinned: {
      type: Boolean,
      required: true,
      enum: [true, false],
      default: false
    },
    status: {
      type: String,
      required: true,
      enum: ['note', 'trash', 'archive'],
      default: 'note'
    },
    due: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

noteSchema.index({ user: 1, name: 1 })

export const Note = mongoose.model('note', noteSchema)
