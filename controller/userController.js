import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";

export const getDetails = async (req, res) => {
  if (req.body?.token) {
    try {
      const response = {
        data: await userModel.findOne({
          _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
        }),
      };
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
    }
  }
};

export const otherProfile = async (req, res) => {
  const response = {}
  console.log(req.params.id);
  const other = await userModel.findOne({
    _id: req.params.id
  })
  console.log(other);
  response.data = other
  const contacts = []
  for (let i = 0; i < other.contacts.length; i++) {
    contacts[i] = await userModel.findOne({ _id: other.contacts[i] })
  }
  response.contact = contacts
  res.status(200).json(response)
}

export const editProfile = async (req, res) => {
  try {
    if (req.body?.imageData) {
      await cloudinary.uploader
        .upload(req.body.imageData)
        .then((result, err) => {
          if (err) {
            console.error(err);
            response.status = false;
            res.json(response);
          } else req.body.imageData = result.secure_url;
        });
    }
    const edit = await userModel.findOneAndUpdate(
      {
        _id: jwt.verify(req.body.editedData.token, process.env.TOKEN_SECRET)
          .userId,
      },
      {
        $set: {
          firstName: req.body.editedData?.firstName,
          lastName: req.body.editedData?.lastName,
          facebook: req.body.editedData?.facebook,
          instagram: req.body.editedData?.instagram,
          twitter: req.body.editedData?.twitter,
          description: req.body.editedData?.description,
          phone: req.body.editedData?.phone,
          location: req.body.editedData?.location,
          job: req.body.editedData?.job,
          image: req.body?.imageData,
        },
      }
    );
    await edit.save().then(() => {
      const response = { status: true };
      res.status(200).json(response);
    });
  } catch (error) {
    console.error(error);
  }
};

export const addContact = async (req, res) => { //only request, no actual adding of contact
  const response = {};
  const userId = jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId;
  const user = await userModel.findOne({ _id: req.params.id });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.requests.includes(userId)) {
    await userModel.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { requests: userId } }
    );
    res.status(200).json({ request: false });
  } else {
    await userModel.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { requests: userId } }
    );
    res.status(200).json({ request: true });
  }
};

export const checkRequests = async (req, res) => {
  try {
    const user = await userModel.findOne({
      _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
    });
    const requests = user.requests;
    const requestedUser = [];
    for (let i = 0; i < user.requests.length; i++) {
      const userQuery = userModel.findOne({ _id: requests[i] });
      const user = await userQuery.exec();
      requestedUser.push(user);
    }
    const response = {
      data: requestedUser,
    };
    res.status(200).json(response);
  } catch (error) {
    console.log('no token');
  }

};

export const acceptRequest = async (req, res) => {
  const user = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (user.requests.includes(req.params.id)) {
    user.contacts.addToSet(req.params.id);
    user.requests = user.requests.filter((id) => id !== req.params.id);
    await user.save();
    const response = {
      status: true,
    };
    res.status(200).json(response);
  }
};

export const declineRequest = async (req, res) => {
  const user = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (user.requests.includes(req.params.id)) {
    user.requests = user.requests.filter((id) => id !== req.params.id);
    await user.save();
    const response = {
      status: true,
    };
    res.status(200).json(response);
  }
};

export const userProfile = async (req, res) => {
  const response = {};
  const currentUserId = jwt.verify(
    req.params.token,
    process.env.TOKEN_SECRET
  ).userId;
  const isContact = await userModel.find({
    $and: [
      { _id: req.params.id },
      { contacts: { $elemMatch: { $eq: currentUserId } } },
    ],
  });
  if (isContact.length === 0) {
    response.contact = false;
    const isRequested = await userModel.find({
      $and: [
        { _id: req.params.id },
        { requests: { $elemMatch: { $eq: currentUserId } } },
      ],
    });
    if (isRequested.length !== 0) {
      response.request = true;
    } else {
      response.request = false;
    }
  } else {
    response.contact = true;
  }
  response.data = await userModel.find({ _id: req.params.id });

  // Check if viewed profile is same as user
  const user = await userModel.findOne({ _id: currentUserId });
  if (user._id.toString() === req.params.id) {
    res.status(206).json(response);
  } else {
    res.status(200).json(response);
  }
};

export const getConnection = async (req, res) => {
  const user = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  const contacts = [];
  for (let i = 0; i < user.contacts.length; i++) {
    const userQuery = userModel.findOne({ _id: user.contacts[i] });
    const contact = await userQuery.exec();
    contacts.push(contact);
  }
  try {
    const response = {
      data: contacts,
    };
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
  }
};

export const removeConnection = async (req, res) => {
  const user = await userModel.findOne({
    _id: jwt.verify(req.params.token, process.env.TOKEN_SECRET).userId,
  });
  await userModel.findOneAndUpdate(
    { _id: user },
    { $pull: { contacts: req.params.id } }
  );
  const response = {
    status: true,
  };
  res.status(200).json(response);
};
// export const memoryMatchWon = async (req, res) => {
//   // console.log(req.body.token);
//   try {
//     const id = jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId
//     const user = await userModel.findOne({ _id: id })
//     // console.log(user);
//     // await userModel.findByIdAndUpdate({ _id: id }, { $inc: { 'gameHistory.memoryMatch.won': 1 } })
//     res.status(200).json(user)
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const memoryMatchLoss = async (req, res) => {
//   // console.log(req.body.token);
//   try {
//     const id = jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId
//     const user = await userModel.findOne({ _id: id })
//     // console.log(user);
//     // await userModel.findByIdAndUpdate({ _id: id }, { $inc: { 'gameHistory.memoryMatch.loss': 1 } })
//     res.status(200).json(user)
//   } catch (error) {
//     console.log(error);
//   }
// }

export const memoryMatchDetails = async (req, res) => {
  // console.log(req.body.token);
  try {
    const id = jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId
    const user = await userModel.findOne({ _id: id })
    // console.log(user);
    // await userModel.findByIdAndUpdate({ _id: id }, { $inc: { 'gameHistory.memoryMatch.won': 1 } })
    res.status(200).json(user)
  } catch (error) {
    console.log(error);
  }
}

export const memoryMatchWon = async (req, res) => {
  // console.log(req.body.token);
  try {
    const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET).userId
    const user = await userModel.findOne({ _id: id })
    await userModel.updateOne({ _id: id }, { $inc: { 'gameHistory.memoryMatch.won': 1 } })
    // console.log(user);
    res.status(200)
  } catch (error) {
    console.log(error);
  }
}
export const memoryMatchLoss = async (req, res) => {
  // console.log(req.body.token);
  try {
    const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET).userId
    const user = await userModel.findOne({ _id: id })
    await userModel.updateOne({ _id: id }, { $inc: { 'gameHistory.memoryMatch.lost': 1 } })
    // console.log(user);
    res.status(200)
  } catch (error) {
    console.log(error);
  }
}