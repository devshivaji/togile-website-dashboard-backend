import { Router } from "express";
import {
  createLead,
  updateLead,
  getLeadById,
  getAllLeads,
} from "../../controllers/leads/leadscontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createLead" , createLead);

router.patch("/updateLead/:id", isAuth, updateLead);

router.get("/getLead/:id", isAuth, getLeadById);

router.post("/getAllLeads", isAuth, getAllLeads);

export default router;
