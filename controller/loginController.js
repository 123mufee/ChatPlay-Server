import bcrypt from "bcrypt";
import otpGenerator from "../utils/otpGenerator.js";
import sendMail from "../utils/nodemailer.js";
import { generateToken } from "../utils/generateJWT.js";
import { parseISO, differenceInYears } from "date-fns";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import {
  sendOtpHelper,
  otpVerify,
  forgotPasswordOtpHelper,
} from "./helpers/loginHelper.js";

// Login
export const signIn = async (req, res) => {
  try {
    const response = {};
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      if (user.block) {
        response.block = true;
        res.status(200).json(response);
      } else {
        response.user = true;
        response.block = false;
        bcrypt.compare(password, user.password, function (err, result) {
          if (result) {
            const token = generateToken({
              userId: user._id,
              name: user.firstName,
              type: "user",
            });
            const userName = user.firstName;
            response.token = token;
            response.password = true;
            response.name = userName;
            res.status(200).json(response);
          } else {
            response.password = false;
            res.status(200).json(response);
          }
        });
      }
    } else {
      response.user = false;
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
};

// Sent OTP Through otp helper
export const sendOtp = async (req, res) => {
  if (
    req.body?.email &&
    req.body?.phone &&
    req.body?.firstName &&
    req.body?.lastName &&
    req.body?.dob
  ) {
    const userDate = parseISO(req.body.dob);
    const now = new Date();
    const age = differenceInYears(now, userDate);
    if (age >= 21) {
      const user = req.body;
      sendOtpHelper(user).then((response) => {
        res.status(200).json(response);
      });
    }
  } else {
    console.error("please fill the whole form");
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  const response = {};
  const email = req.body;
  await otpGenerator().then((otp) => {
    sendMail(email, otp).then((result) => {
      if (result.otpSent) {
        response.otpSent = true;
        response.status = true;
        otpVerify = otp;
        res.status(200).json(response);
      } else {
        response.otpSent = false;
        response.status = false;
        res.status(200).json(response);
      }
    });
  });
};

// Check Oauth
export const checkOauth = async (req, res) => {
  const response = {};
  const mail = req.body.userData.oauthMail;
  const user = await userModel.findOne({ email: mail });
  if (!user) {
    // User does not exist, so redirect them to register page
    response.status = false;
  } else {
    response.status = true;
    // res.status(304).json(response);
  }
  res.status(200).json(response);
};

// Signup by verifying the OTP
export const verifyOtpAndSignUp = async (req, res) => {
  try {
    const response = {
      status: null,
    };
    const user = req.body.userData;
    const otp = req.body.otp;
    if (otp === otpVerify) {
      await bcrypt.hash(user.password, 10).then((hash) => {
        user.password = hash;
      });
      const newUser = new userModel({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        dateOfBirth: user.dob,
        type: user.type,
        password: user.password,
      });
      await newUser.save().then(() => {
        response.status = true;
      });
    } else {
      response.status = false;
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(404);
    console.error(error);
  }
};

// Add Oauth user
export const addUser = async (req, res) => {
  const response = {};
  if (
    req.body?.oauthMails &&
    req.body?.phone &&
    req.body?.firstName &&
    req.body?.lastName &&
    req.body?.dob
  ) {
    const newUser = new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.oauthMails,
      dateOfBirth: req.body.dob,
      type: req.body.type,
      password: req.body.type,
    });
    await newUser.save().then(() => {
      response.status = true;
      res.status(200).json(response);
    });
  } else {
    response.status = false;
    res.status(200).json(response);
  }
};

// Check if user exists
export const userCheck = (req, res) => {
  try {
    const response = {
      type: "user",
    };
    const token = req.body.token;
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, result) => {
        if (err) {
          console.error(err);
          response.status = false;
          res.json(response);
        } else {
          const user = await userModel.findOne({ _id: result.userId });
          if (user) {
            if (!user.block) {
              response.user = true;
              response.userName = user.fullName;
              res.status(200).json(response);
            } else {
              response.user = false;
              res.status(200).json(response);
            }
          } else {
            response.user = false;
            res.status(200).json(response);
          }
        }
      });
    } else {
      response.user = false;
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      await forgotPasswordOtpHelper(user).then((response) => {
        res.status(200).json(response);
      });
    } else {
      response.user = false;
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(error);
  }
};

export const forgotPasswordOtp = async (req, res) => {
  try {
    const response = {};
    const otp = req.body.otp;
    if (otp === otpVerify) {
      response.status = true;
      res.status(200).json(response);
    } else {
      response.status = false;
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(error);
  }
};

export const forgotPasswordResendOtp = async (req, res) => {
  try {
    const response = {};
    const email = req.body;
    await otpGenerator().then((otp) => {
      sendMail(email, otp).then((result) => {
        if (result.otpSent) {
          response.status = true;
          otpVerify = otp;
          res.status(200).json(response);
        } else {
          response.status = false;
          res.status(200).json(response);
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const response = {};
    const user = await userModel.findOne({ email: req.body.email });
    await bcrypt.hash(user.password, 10).then((hash) => {
      user.password = hash;
    });
    if (user.password === user.password) {
      response.status = false;
      res.status(200).json(response);
    } else {
      await userModel
        .updateOne({ email: user.email }, { password: user.password })
        .then(() => {
          response.status = true;
          res.status(200).json(response);
        });
    }
  } catch (error) {
    console.error(error);
  }
};
