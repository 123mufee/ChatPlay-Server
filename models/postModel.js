import mongoose from "mongoose";
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const postSchema = new Schema ({
    user: {
        type: String,
        // ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: new Date()
    },
    like: {
        type:[String]
    },
    report: {
        type: [String]
    },

})

const postModal = mongoose.model('Post', postSchema);
export default postModal;