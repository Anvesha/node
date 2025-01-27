import express from "express";
import { signup, login, logout, forgetpassword, resendPassword} from "../controller/user.controller.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgetpassword", forgetpassword);
router.post("/resendpassword", resendPassword);

export default router;