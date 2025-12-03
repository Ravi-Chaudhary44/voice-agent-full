import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, RefreshCw, Clock } from "lucide-react";

interface FeedbackData {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  skillBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultural: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  const fetchFeedback = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
      setFeedback(null);
      setLoadingProgress(0);
    }

    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1; 
      });
    }, 80);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!sessionId || sessionId.length < 10) {
        throw new Error("Invalid session ID");
      }

      console.log(`Fetching feedback for session: ${sessionId}, attempt: ${retryCount + 1}`);

      const response = await fetch(
        `${API_BASE_URL}/interview/result/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        
        if (retryCount < 10) { 
          setRetryCount(prev => prev + 1);
          setIsPolling(true);
          throw new Error("feedback_processing");
        } else {
          throw new Error("Feedback generation is taking longer than expected. Please try again in a few minutes.");
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Failed to fetch feedback: ${response.status}`);
        }
      }

      const data = await response.json();

      if (
        typeof data.overallScore !== "number" ||
        !data.skillBreakdown ||
        !Array.isArray(data.strengths) ||
        !Array.isArray(data.improvements) ||
        typeof data.detailedFeedback !== "string"
      ) {
        throw new Error("Invalid feedback data structure");
      }

      setFeedback(data);
      setIsPolling(false);
      setError(null);

    } catch (err) {
      console.error("Error fetching feedback:", err);
      
      if (err.message === "feedback_processing") {
       
        setError(null);
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Could not fetch feedback. Please try again.");
      }
    } finally {
      if (!isPolling || error) {
        setLoading(false);
      }
      clearInterval(loadingInterval);
    }
  };

 
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (isPolling && retryCount < 10) {
      pollingInterval = setInterval(() => {
        fetchFeedback(true);
      }, 3000); 
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isPolling, retryCount]);

 
  useEffect(() => {
    fetchFeedback();
  }, [navigate, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6 p-8">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 animate-bounce">
              <img src="/Ai.gif" width={150} height={150} className="rounded-full" alt="Loading" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isPolling ? "Processing Your Interview" : "Generating Your Feedback"}
          </h2>
          <p className="text-gray-600 max-w-md">
            {isPolling 
              ? `Our AI is analyzing your responses... (Attempt ${retryCount}/10)`
              : "Our AI is analyzing your interview performance and preparing detailed insights..."
            }
          </p>
          <div className="w-80 space-y-2">
            <Progress value={loadingProgress} className="h-2" />
            <p className="text-sm text-gray-500">{Math.round(loadingProgress)}% Complete</p>
          </div>
          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm">This may take a few moments...</span>
            </div>
          )}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isPolling) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">{error}</div>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => {
                setRetryCount(0);
                setIsPolling(false);
                fetchFeedback();
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-center px-4">
        No feedback data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
   
      <nav className="bg-white shadow-sm border-b transition-all duration-300 hover:shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Interview Feedback</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </nav>

    
      <div className="p-6 max-w-4xl mx-auto space-y-6">
     
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-blue-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Overall Score</h2>
            <Progress value={feedback.overallScore} className="mb-2 h-3" />
            <p className="text-sm text-muted-foreground font-medium">{feedback.overallScore}%</p>
          </CardContent>
        </Card>

       
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-green-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Skill Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(feedback.skillBreakdown).map(([skill, score]) => (
                <div key={skill} className="transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg">
                  <p className="capitalize text-sm font-medium text-gray-700">
                    {skill.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <Progress value={score} className="mb-1 h-2" />
                  <p className="text-xs text-muted-foreground">{score}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

       
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-emerald-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Strengths</h2>
            {feedback.strengths.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {feedback.strengths.map((point, index) => (
                  <li 
                    key={index} 
                    className="text-green-700 transition-all duration-200 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths provided.</p>
            )}
          </CardContent>
        </Card>

      
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-orange-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Areas for Improvement</h2>
            {feedback.improvements.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {feedback.improvements.map((point, index) => (
                  <li 
                    key={index} 
                    className="text-red-700 transition-all duration-200 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No improvement areas provided.</p>
            )}
          </CardContent>
        </Card>

      
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-purple-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Detailed Feedback</h2>
            <Separator className="my-2" />
            <div className="transition-all duration-200 hover:bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {feedback.detailedFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

      
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => {
              setRetryCount(0);
              setIsPolling(false);
              fetchFeedback();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
