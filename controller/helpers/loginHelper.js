import userModel from "../../models/userModel.js";
import otpGenerator from "../../utils/otpGenerator.js";
import sendMail from "../../utils/nodemailer.js";

export let otpVerify;

export const sendOtpHelper = (user) => {
  return new Promise(async (resolve, reject) => {
    const response = {
      status: null,
      otpSent: null,
    };
    const userExist = await userModel.findOne({ email: user.email });
    if (userExist) {
      response.status = false;
    } else {
      // await otpGenerator().then((otp) => {
      //     sendMail(user.email, otp).then((result) => {
      //         if (result.otpSent) {
      //             response.otpSent = true
      //             response.status = true
      //             otpVerify = otp
      //         } else {
      //             response.otpSent = false
      //         }
      //     })
      // })

      await otpGenerator().then((otp) => {
        response.otpSent = true;
        response.status = true;
        otpVerify = otp;
        console.log(otpVerify, "otpverify inside helper");
      });
    }
    resolve(response);
  });
};

export const forgotPasswordOtpHelper = (user) => {
  return new Promise(async (resolve, reject) => {
    const response = {
      status: null,
      otpSent: null,
    };
    const userExist = await userModel.findOne({ email: user.email });
    if (!userExist) {
      response.status = false;
    } else {
      // await otpGenerator().then((otp) => {
      //     sendMail(user.email, otp).then((result) => {
      //         if (result.otpSent) {
      //             response.otpSent = true
      //             response.status = true
      //             otpVerify = otp
      //         } else {
      //             response.otpSent = false
      //         }
      //     })
      // })
      await otpGenerator().then((otp) => {
        response.otpSent = true;
        response.status = true;
        otpVerify = otp;
        // console.log(otpVerify, 'otpverify inside helper');
      });
    }
    resolve(response);
  });
};
