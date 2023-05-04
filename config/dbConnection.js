import mongoose from "mongoose";

const connection = ()=>{
    // mongoose.connect('mongodb://0.0.0.0:27017/chatplay2')
    mongoose.connect('mongodb+srv://chatplay:0000@cluster0.u56d310.mongodb.net/chatPlay?retryWrites=true&w=majority')
}
mongoose.set('strictQuery', true);

export default connection