import express from "express";
import { verifyJWT } from "../middlewares/verifyJwt.js";
import {
  register,
  login,
  logout,
  getUser,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", verifyJWT, getUser);

export default router;
