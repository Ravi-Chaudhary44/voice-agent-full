import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
const API_BASE_URL = import.meta.env.VITE_API_URL;

import {
  Clock,
  Briefcase,
  Users,
  FileText,
  Brain,
  ChevronRight,
} from "lucide-react";

const QuestionList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const detailsId = id; 
  const {
    jobPosition = "",
    jobDescription = "",
    timeDuration = "",
    interviewType = "",
    openaiMessage = "",
  } = location.state || {};

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      if (!detailsId) {
        console.error("detailsId is missing");
        return;
      }
      
      console.log("Using detailsId:", detailsId);
      
     const response = await fetch(`${API_BASE_URL}/interview/start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json",  "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ detailsId })
      });

      if (!response.ok) throw new Error("Failed to start interview");
      
      const data = await response.json();
      navigate(`/interview/${data.data._id}`);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };
    
  if (!jobPosition || !jobDescription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <Card className="max-w-lg mx-auto shadow-xl border border-green-500 bg-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-900" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-400">
              No Interview Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-green-300 text-lg">
              Please start an interview from the Dashboard.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-gray-900 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Clean JSON handling for openaiMessage
  let aiContent = "";
  let questionsArray = [];

  if (openaiMessage) {
    try {
      const parsed =
        typeof openaiMessage === "string"
          ? JSON.parse(openaiMessage)
          : typeof openaiMessage.content === "string"
            ? JSON.parse(openaiMessage.content)
            : openaiMessage;

      if (parsed.questions && Array.isArray(parsed.questions)) {
        questionsArray = parsed.questions;
      } else {
        aiContent = JSON.stringify(parsed, null, 2);
      }
    } catch (err) {
      aiContent =
        typeof openaiMessage === "string"
          ? openaiMessage
          : openaiMessage.content || "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            Interview Preparation
          </h1>
          <p className="text-green-300 text-lg">
            Review your interview details and AI-generated questions
          </p>
        </div>

        {/* Interview Details */}
        <Card className="shadow-xl border border-green-500 bg-gray-800 hover:shadow-2xl transition-all duration-300 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 rounded-t-xl">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group hover:bg-green-500/10 p-4 rounded-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Briefcase className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-300 uppercase tracking-wide">
                    Job Position
                  </p>
                </div>
                <p className="text-xl font-bold text-green-100">{jobPosition}</p>
              </div>

              <div className="group hover:bg-green-500/10 p-4 rounded-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-300 uppercase tracking-wide">
                    Duration
                  </p>
                </div>
                <p className="text-xl font-bold text-green-100">
                  {timeDuration} minutes
                </p>
              </div>

              <div className="group hover:bg-green-500/10 p-4 rounded-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-300 uppercase tracking-wide">
                    Interview Type
                  </p>
                </div>
                <p className="text-xl font-bold text-green-100">
                  {interviewType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="shadow-xl border border-green-500 bg-gray-800 hover:shadow-2xl transition-all duration-300 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 rounded-t-xl">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gray-700 p-6 rounded-xl border border-green-500">
              <div className="text-green-300 leading-relaxed whitespace-pre-line">
                {jobDescription}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Questions */}
        {(questionsArray.length > 0 || aiContent) && (
          <Card className="shadow-xl border border-green-500 bg-gray-800 hover:shadow-2xl transition-all duration-300 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 rounded-t-xl">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Generated Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {questionsArray.length > 0 ? (
                <div className="space-y-4">
                  {questionsArray.map((q, idx) => (
                    <div
                      key={idx}
                      className="group bg-gray-700 p-6 rounded-xl border border-green-500 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-gray-900 text-xs font-semibold rounded-full">
                              {q.type}
                            </span>
                          </div>
                          <p className="text-green-100 font-medium leading-relaxed">
                            {q.question}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700 p-6 rounded-xl border border-green-500">
                  <div className="text-green-300 whitespace-pre-line leading-relaxed">
                    {aiContent}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Separator className="my-8 bg-green-500/30" />

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-gray-900 px-12 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
