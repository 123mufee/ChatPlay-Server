import express from "express";
const router = express.Router();
import {
  checkOauth,
  forgotPassword,
  resendOtp,
  sendOtp,
  signIn,
  userCheck,
  verifyOtpAndSignUp,
  forgotPasswordOtp,
  forgotPasswordResendOtp,
  resetPassword,
  addUser,
} from "../controller/loginController.js";
import {
  getDetails,
  editProfile,
  addContact,
  checkRequests,
  acceptRequest,
  declineRequest,
  getConnection,
  userProfile,
  removeConnection,
  otherProfile,
  memoryMatchWon,
  memoryMatchLoss,
} from "../controller/userController.js";

// Login Routes
router.post("/getOtp", sendOtp);
router.post("/signup", verifyOtpAndSignUp);
router.post("/signin", signIn);
router.post("/authenticate", userCheck);
router.post("/resendOtp", resendOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/forgotPasswordOtp", forgotPasswordOtp);
router.post("/forgotPasswordResendOtp", forgotPasswordResendOtp);
router.post("/resetPassword", resetPassword);
router.post("/addOauth", addUser);
router.post("/checkOauth", checkOauth);

// Post Login Routes
router.post("/getDetails", getDetails);
router.get('/otherProfile/:id', otherProfile)
router.post("/editProfile", editProfile);

router.get("/userProfile/:id/:token", userProfile)

router.patch("/addContact/:id", addContact);
router.patch("/checkRequests", checkRequests)
router.put('/acceptRequest/:id', acceptRequest)
router.put('/declineRequest/:id', declineRequest)
router.patch('/getConnection', getConnection)

router.delete('/removeConnection/:id/:token', removeConnection)

// games
// router.post("/memorywon", memoryMatchWon)
router.get('/memoryWon/:win/:token', memoryMatchWon)
router.get('/memoryLoss/:loss/:token', memoryMatchLoss)

export default router;
