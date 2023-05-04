import mongoose from 'mongoose';

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    game: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Messages', MessageSchema);
