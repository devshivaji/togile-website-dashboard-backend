import { Router } from "express";
import {
  createProfile,
  updateProfile,
  getProfileById,
  getAllProfiles,
} from "../../controllers/permission/permissioncontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createProfile", isAuth, createProfile);

router.patch("/updateProfile/:id", isAuth, updateProfile);

router.get("/getProfileById/:id", isAuth, getProfileById);

router.post("/getAllProfiles", isAuth, getAllProfiles);

export default router;
