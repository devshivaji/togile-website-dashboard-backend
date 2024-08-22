import { Router } from "express";
import {
  createCareer,
  getCareerById,
  getAllCareers,
  uploadresume,
} from "../../controllers/career/careercontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post(
  "/createCareer",
  isAuth,
  uploadresume.single("resume"),
  createCareer
);

router.get("/getcareerbyid/:id", isAuth, getCareerById);

router.post("/getAllcareers", isAuth, getAllCareers);

export default router;
