import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Details",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
 answers: [{
    questionIndex: Number,
    answer: String,
    timestamp: Date
  }],
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default:"" 
  }
}, { timestamps: true });

export const InterviewSession =
  mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", interviewSessionSchema);

