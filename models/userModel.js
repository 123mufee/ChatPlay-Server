import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  password: {
    type: String,
  },
  block: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "local",
    // local stands for local account and oauth stands for accounts logged in with oauth
  },
  // Optional fields
  image: {
    type: String,
  },
  job: {
    type: String,
    default: "unspecified",
  },
  location: {
    type: String,
    default: "unspecified",
  },
  facebook: {
    type: String,
    default: "unspecified",
  },
  twitter: {
    type: String,
    default: "unspecified",
  },
  instagram: {
    type: String,
    default: "unspecified",
  },
  github: {
    type: String,
    default: "unspecified",
  },
  description: {
    type: String,
    default: "Nice to meet you!",
  },
  blocked: {
    type: [String],
  },
  requests: {
    type: [String],
  },
  contacts: {
    type: [String],
  },
  gameHistory: {
    ticTacToe: {
      won: {
        type: Number,
        default: 0.0
      },
      lost: {
        type: Number,
        default: 0.0

      }
    },
    memoryMatch: {
      won: {
        type: Number,
        default: 0.0

      },
      lost: {
        type: Number,
        default: 0.0
      }
    },
  },
  // Chat required, for some wierd reason
  isAvatarImageSet: {
    type: Boolean,
    default: true,
  },
  avatarImage: {
    type: String,
    default: "none",
  },
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
