import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "https://voice-agent-full-1.onrender.com", 
  credentials: true
}));

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import googleauth from './router/auth.routes.js';
import question from './router/question.routes.js';
import user from './router/user.routes.js';
import interview from "./router/interview.routes.js";

app.use('/api/auth', googleauth);
app.use('/api/question', question);
app.use('/api/user', user);
app.use('/api/interview', interview);

export default app;
