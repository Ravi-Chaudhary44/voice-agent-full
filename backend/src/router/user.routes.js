import {Router} from "express";
import {registerUser,loginUser,getinfo} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.get("/me",verifyJWT,getinfo);

export default router;