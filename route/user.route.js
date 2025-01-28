import express from "express";
import { signup, login, logout, changepassword, forgetPassword} from "../controller/user.controller.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/changepassword", changepassword);
router.post("/forgetPassword", forgetPassword);

export default router;