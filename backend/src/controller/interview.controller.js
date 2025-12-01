import { InterviewSession } from "../models/interviewSession.model.js";
import { Details } from "../models/details.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import OpenAI from "openai";

const startInterview = asyncHandler(async (req, res) => {
  const user = req.user;
  const { detailsId } = req.body;
  
  if (!detailsId) {
    throw new ApiError(400, "Details ID is required");
  }

 
  const details = await Details.findById(detailsId);
  if (!details) {
    throw new ApiError(404, "Interview details not found");
  }

 
  const session = await InterviewSession.create({
    user: user._id,
    details: detailsId,
    currentQuestionIndex: 0,
    questions: details.question, 
    answers: [],
    feedback: "",
  });

  res
    .status(201)
    .json(new ApiResponse(201, session, "Interview session started"));
});


const getSession = asyncHandler(async (req, res) => {
  const session = await InterviewSession.findById(req.params.id)
    .populate("details")
    .populate("user");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res.status(200).json(new ApiResponse(200, session, "Session retrieved"));
});


import { FEEDBACK_PROMPT } from "../services/contant.js";

const saveAnswers = async (req, res) => {
  try {
    
    const { sessionId } = req.params; 
    const { answers } = req.body;

   
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "Invalid answers format. Expected non-empty array",
      });
    }

    
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

   
    const conversation = answers.map((a) => a.answer).join("\n");
    
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      conversation
    );

    
    let feedback = "";
    try {
     const completion = await openai.chat.completions.create({
  model: "x-ai/grok-4.1-fast:free",
  messages: [
    {
      role: "system",
      content: `
You are an AI interview assistant created  for a custom interview system.

`
    },
    {
      role: "user",
      content: FINAL_PROMPT
    }
  ],
  response_format: { type: "json_object" }
});


      const rescontent = completion.choices[0]?.message?.content || "";
      
      if (rescontent) {
    
        try {
          const parsed = JSON.parse(rescontent);
          feedback =
            typeof parsed === "string" ? parsed : JSON.stringify(parsed);
        } catch (e) {
          feedback = rescontent;
        }
      }
    } catch (error) {
      console.error(`Error generating feedback: ${error.message}`);
      
      feedback = conversation;
    }

   
    const updatedSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          answers,
          feedback,
          currentQuestionIndex:
            answers.length > 0
              ? Math.max(...answers.map((a) => a.questionIndex)) + 1
              : 0,
        },
      },
      { new: true, runValidators: true }
    );

    console.log("✅ Updated InterviewSession:", updatedSession);

    if (!updatedSession) {
      return res.status(404).json({ error: "Interview session not found." });
    }

    res.status(200).json({
      message: "Answers and feedback saved successfully.",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error saving answers:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

const getResult = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const session = await InterviewSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (!session.feedback) {
    throw new ApiError(404, "Feedback not available for this session");
  }

  try {
    let feedbackData = session.feedback;
    if (typeof feedbackData === 'string') {
      feedbackData = JSON.parse(feedbackData);
    }

   
    const aiFeedback = feedbackData.feedback || {};

    
    const rating = aiFeedback.rating || {};
    const ratings = [
      rating.technicalSkills || 0, 
      rating.communication || 0,
      rating.problemSolving || 0,
      rating.experience || 0        
    ];
    
    const overallScore = ratings.length 
      ? Math.round((ratings.reduce((sum, val) => sum + val, 0) / ratings.length) * 10) 
      : 0;

    
    const detailedParts = [
      aiFeedback.summary || '',
      aiFeedback.recommendationMsg || ''
    ].filter(Boolean);
    
    const mappedFeedback = {
      overallScore,
      strengths: aiFeedback.strengths || [],  
      improvements: aiFeedback.improvements || [],  
      detailedFeedback: detailedParts.join('\n\n'),
      skillBreakdown: {
        technical: (rating.technicalSkills || 0) * 10,
        communication: (rating.communication || 0) * 10,
        problemSolving: (rating.problemSolving || 0) * 10,
        cultural: (rating.experience || 0) * 10
      }
    };
console.log(mappedFeedback)
    res.status(200).json(mappedFeedback);

  } catch (error) {
    console.error("Error processing feedback:", error);
    throw new ApiError(500, "Failed to process feedback data");
  }
});

export { startInterview, getSession, saveAnswers ,getResult};
