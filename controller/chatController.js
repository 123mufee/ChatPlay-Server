import userModel from "../models/userModel.js";
import Messages from "../models/messageModel.js";
import jwt from 'jsonwebtoken'

export const userData = async (req, res) => {
  if (req.body.token) {
    const response = {
      data: await userModel.findOne({ _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId })
    }
    res.status(200).json(response)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    // const users = await userModel
    //   .find({ _id: { $ne: req.params.id } })
    //   .select(["email", "firstName", "avatarImage", "_id"]);
    const user = await userModel
      .findOne({ _id: req.params.id });
      const contacts = user.contacts
      // console.log(contacts);
      const people = []
      for(let i=0;i<contacts.length;i++) {
        people[i] = await userModel.findOne({_id: contacts[i]})
      }
      // // console.log(people);


    return res.json(people);
  } catch (ex) {
    next(ex);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};


export const getId = async(req, res) => {
  // console.log(req.params.id);
  const connectedUser=await userModel.findOne({_id:req.params.id});
  res.status(200).json(connectedUser)

}