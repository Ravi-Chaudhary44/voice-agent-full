import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { startInterview, getSession,saveAnswers,getResult } from "../controller/interview.controller.js";
const router=Router();

router.post('/start',verifyJWT,startInterview);
router.get('/get/:id',getSession);
router.put('/answer/:sessionId',saveAnswers);
router.get('/result/:sessionId',getResult)
export default router;