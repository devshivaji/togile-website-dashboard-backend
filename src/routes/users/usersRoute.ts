import { Router } from "express";
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  userLogin,
  logout,
} from "../../controllers/users/userscontroller";
import { isAuth } from "../../middlewares/auth";
const router = Router();

router.post("/createuser", isAuth, createUser);

router.post("/userlogin",  userLogin);
router.post("/logout", logout);

router.get("/getuserbyid/:id", isAuth, getUserById);

router.post("/getAllusers", isAuth, getAllUsers);

router.patch("/updateUser/:id", isAuth, updateUser);

export default router;
