import { Router } from "express";
import {
  createMeeting,
  getMeetingById,
  getAllMeetings,
  updateMeeting,
} from "../../controllers/meeting/meetingcontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createMeeting", isAuth,createMeeting);

router.get("/getMeetingById/:id", isAuth, getMeetingById);

router.post("/getAllMeetings",isAuth, getAllMeetings);

router.patch("/updateMeeting/:id",isAuth, updateMeeting);

export default router;
