import express from "express";
import { userData, addMessage, getAllUsers, getMessages, getId } from "../controller/chatController.js";
const router = express.Router();

router.get("/allusers/:id", getAllUsers);

router.post("/userData", userData)
router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);

router.get('/getId/:id', getId)

export default router;