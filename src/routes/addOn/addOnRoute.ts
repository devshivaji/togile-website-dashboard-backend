import { Router } from "express";
import {
  createAddon,
  updateAddon,
  getAddonById,
  getAllAddons,
  deleteAddonById,
  getAllAddOnData,
} from "../../controllers/addOn/addOncontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createAddon", isAuth, createAddon);

router.patch("/updateAddon/:id",isAuth, updateAddon);

router.get("/getAddonById/:id", getAddonById);

router.post("/getAllAddons/", isAuth, getAllAddons);

router.delete("/deleteAddonById/:id", isAuth, deleteAddonById);

router.get("/getAllAddOnData",getAllAddOnData)

export default router;
