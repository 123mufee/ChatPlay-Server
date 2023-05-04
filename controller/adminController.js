import {
  blockingUser,
  userDetails,
  unBlockingUser,
  adminLogging,
} from "./helpers/adminHelper.js";

export const adminLogin = (req, res) => {
  adminLogging(req.body).then((response) => {
    res.status(200).json(response);
  });
};

export const getUsers = (req, res) => {
  userDetails()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      console.error(error.message);
    });
};

export const blockUser = (req, res) => {
  blockingUser(req.params.id).then((response) => {
    response.status && res.status(200).json(response.status);
  });
};

export const unBlockUser = (req, res) => {
  unBlockingUser(req.params.id).then((response) => {
    response.status && res.status(200).json(response.status);
  });
};
