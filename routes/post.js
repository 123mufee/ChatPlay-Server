import express from "express";
const router = express.Router();
import {
  createPost,
  viewPosts,
  viewUsers,
  userProfile,
  showPost,
  showPostUser,
  likePost,
  snippetHistory,
  deleteSnippet,
  reportPost,
  allPeople,
  connectedUsers,
} from "../controller/postController.js";

router.get("/showPostUser/:id/:token", showPostUser);
router.patch("/userProfile/:id", userProfile);

router.post("/createPost", createPost);
router.post("/people", viewUsers);
router.post("/allPeople", allPeople);
router.post("/posts", viewPosts);


router.post("/connection",connectedUsers)

router.patch("/viewPost/:id", showPost);
router.patch("/likePost/:id", likePost);
router.patch("/reportPost/:id", reportPost)
router.patch("/snippetHistory", snippetHistory);

router.delete("/deletePost/:id", deleteSnippet);

export default router;
