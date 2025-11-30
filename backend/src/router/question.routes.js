import { Router } from 'express';
import { generateQuestions, getUser, uploadFile } from '../controller/openai.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

router.post("/generate-questions", verifyJWT, generateQuestions);
router.post("/upload-file", verifyJWT, upload.single('file'), uploadFile);
router.get("/getuser", verifyJWT, getUser);

export default router;