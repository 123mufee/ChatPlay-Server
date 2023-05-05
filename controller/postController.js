import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";
import cloudinary from "../utils/cloudinary.js";

/*----------------------      OTHER USER MANAGMENT      ----------------------*/

// This function is used to get and display 10 random users from database,
// excluding current user. If not logged in, no data is returned
export const viewUsers = async (req, res) => {
  const userCheck = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (userCheck) {

  // const people = [];
  // for (let i = 0; i < userCheck.contacts.length; i++) {
  //   const person = await userModel.findOne({ _id: userCheck.contacts[i] });
  //   people.push(person);
  // }

  // const excludedIds = people.map((person) => person._id);
  // excludedIds.push(userCheck._id);

  const response = {
    data: await userModel.aggregate([
      { $sample: { size: 10 } }, // get 10 random data
      { $match: { _id: { $ne: userCheck._id } } },  // exclude logged in user and connected persons from the random dataset
      // { $match: { _id: { $nin: excludedIds } } },  // exclude logged in user and connected persons from the random dataset
      { $group: { _id: "$_id", data: { $addToSet: "$$ROOT" } } }, // add the data to set, so that duplicate values are ignored
      { $unwind: "$data" }, // remove the array and give output as object
      { $replaceRoot: { newRoot: "$data" } }, // change the set from root set to something else for sending
    ]),
  };
  res.status(200).json(response);
  }
};

export const connectedUsers = async (req, res) => {
  const user = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (user) {
    // const user = await userModel
    // .findOne({ _id: req.params.id });
    const contacts = user.contacts
    // console.log(contacts);
    const people = []
    for (let i = 0; i < contacts.length; i++) {
      people[i] = await userModel.findOne({ _id: contacts[i] })
    }
    console.log(people);


    return res.status(200).json(people);
  }

}

export const allPeople = async (req, res) => {
  const userCheck = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (userCheck) {
    const response = {
      data: await userModel.find({ _id: { $ne: userCheck._id } }),
    };
    res.status(200).json(response);
  }
};

// This function is used to send selected user's details so that it can
// be rendered into the otherProfile modal.
export const userProfile = async (req, res) => {
  const currentUserId = jwt.verify(
    req.body.token,
    process.env.TOKEN_SECRET
  ).userId;
  const response = {};

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

  response.data = await userModel.findOne({ _id: req.params.id });

  res.status(200).json(response);
};

/*------------------      END OF OTHER USER MANAGMENT      ------------------*/

/*----------------------      POST MANAGMENT      ----------------------*/

// This function is used to get and display 10 random posts from database,
// excluding those that are posted by the user itself. If not logged in,
// no data is returned
export const viewPosts = async (req, res) => {
  const tokenCheck = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
  const userCheck = await userModel.findOne({ _id: tokenCheck.userId });
  if (userCheck) {
    const response = {
      data: await postModel.aggregate([
        // { $sample: { size: 20 } }, // get 12 random data
        { $match: { user: { $ne: tokenCheck.userId } } }, // exclude data posted by a current user
        { $group: { _id: "$_id", data: { $addToSet: "$$ROOT" } } }, // add the data to set, so that duplicate values are ignored
        { $unwind: "$data" }, // remove the array and give output as object
        { $replaceRoot: { newRoot: "$data" } }, // change the set from root set to something else for sending
      ]),
    };
    res.status(200).json(response);
  }
};

// This function is used to get currently selected post's information and
// and return it so that the details can be displayed
export const showPost = async (req, res) => {
  const response = {};
  const userDetail = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  const isLiked = await postModel.findOne({ like: userDetail._id });
  if (isLiked) {
    response.liked = true;
  } else {
    response.liked = false;
  }
  (response.data = await postModel.findOne({ _id: req.params.id })),
    res.status(200).json(response);
};

// This function is used too create a post with user's id so that it can be
// added into the database, and potentially shown to other users
export const createPost = async (req, res) => {
  if (req.body.formData?.token) {
    const userCheck = await userModel.findOne({
      _id: jwt.verify(req.body.formData.token, process.env.TOKEN_SECRET).userId,
    });
    await cloudinary.uploader
      .upload(req.body?.imageData)
      .then((result, err) => {
        if (err) {
          console.error(err);
          response.status = false;
          return res.json(response);
        } else req.body.imageData = result.secure_url;
      });
    const postDetails = req.body.formData.postData;
    if (userCheck) {
      const newPost = new postModel({
        user: userCheck._id,
        userName: userCheck.firstName,
        title: postDetails.title,
        caption: postDetails.caption,
        image: req.body.imageData,
      });
      try {
        await newPost.save();
        const response = {
          status: true,
        };
        res.status(200).json(response);
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export const showPostUser = async (req, res) => {
  try {
    const response = {};
    const postDetail = await postModel.findOne({ _id: req.params.id });
    const userDetail = await userModel.findOne({ _id: postDetail.user });

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
      if (isRequested.length === 0) {
        response.request = true;
      } else {
        response.request = false;
      }
    } else {
      response.contact = true;
    }
    // response.data = await userModel.find({ _id: req.params.id });
    response.data = userDetail;

    // Check if viewed profile is same as user
    const user = await userModel.findOne({ _id: currentUserId });
    if (user._id.toString() === req.params.id) {
      res.status(206).json(response);
    } else {
      res.status(200).json(response);
    }

    // res.status(200).json(response);
  } catch (err) {
    console.error(err);
  }
};

export const likePost = async (req, res) => {
  const userDetail = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (await postModel.findOne({ like: userDetail._id })) {
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { like: userDetail._id } }
    );
  } else {
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { like: userDetail._id } }
    );
  }
  const response = {
    status: true,
  };
  res.status(200).json(response);
};

export const reportPost = async (req, res) => {
  const userDetail = await userModel.findOne({
    _id: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
  });
  if (await postModel.findOne({ report: userDetail._id })) {
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { report: userDetail._id } }
    );
  } else {
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { report: userDetail._id } }
    );
  }
  const post = await postModel.findOne({ _id: req.params.id });
  const response = {
    status: true,
  };
  res.status(200).json(response);
};

/*------------------      END OF POST MANAGMENT      ------------------*/

export const snippetHistory = async (req, res) => {
  if (req.body?.token) {
    // const tokenCheck = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
    // const userCheck = await postModel.find({ user: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId });
    const response = {
      data: await postModel.find({
        user: jwt.verify(req.body.token, process.env.TOKEN_SECRET).userId,
      }),
    };
    res.status(200).json(response);
  }
};

export const deleteSnippet = async (req, res) => {
  await postModel.findByIdAndDelete({ _id: req.params.id });
  const response = { status: true };
  res.status(200).json(response);
};
