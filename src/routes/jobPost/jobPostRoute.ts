import { Router } from "express";
import {
  createJobPost,
  updateJobPost,
  getAllJobPosts,
} from "../../controllers/jobPost/jobPostcontroller";
import { isAuth } from "../../middlewares/auth";
const router = Router();

router.post("/createJobPost", isAuth, createJobPost);

router.patch("/updateJobPost/:id", isAuth, updateJobPost);

router.post("/getAllJobPosts", isAuth, getAllJobPosts);

export default router;
