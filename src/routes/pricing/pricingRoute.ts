import express from "express";
import {
  createPricing,
  getAllPricing,
  getPricingById,
  updatePricing,
  deletePricingById,
  getAllPricingData,
} from "../../controllers/pricing/pricingcontroller";
import { isAuth } from "../../middlewares/auth";

const router = express.Router();

router.post("/createPricing", isAuth, createPricing);

router.post("/getAllPricing", isAuth, getAllPricing);

router.get("/getPricingById/:id", isAuth, getPricingById);

router.patch("/updatePricing/:id", isAuth, updatePricing);

router.delete("/deletePricingById/:id", isAuth, deletePricingById);

router.get('/getAllPricingData', getAllPricingData);

export default router;
