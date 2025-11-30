import FileUpload from "@/components/FileUpload";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Briefcase,
  Clock,
  Target,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [timeDuration, setTimeDuration] = useState("30");
  const [interviewType, setInterviewType] = useState("technical");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setName(data.data.fullName);
      } catch (error) {
        console.error("Error getting user details:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobPosition.trim() || !jobDescription.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter both job position and job description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/question/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({
            jobposition: jobPosition,
            jobdescription: jobDescription,
            duration: timeDuration,
            type: interviewType,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send details to backend");

      const data = await response.json();
      const detailsId = data.detailsId;

      console.log("🔍 Backend response:", data);


      toast({
        title: "Questions generated!",
        description: "Your interview questions are ready. Let's start the interview.",
      });

      localStorage.setItem(
        "questionListState",
        JSON.stringify({
          jobPosition,
          jobDescription,
          timeDuration,
          interviewType,
          detailsId,
        })
      );

     
      navigate(`/question-list/${detailsId}`, {
        state: {
          jobPosition,
          jobDescription,
          timeDuration,
          interviewType,
          openaiMessage: data.message || data.data || data 
        },
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-green-100">
      
      <nav className="bg-gray-800/80 backdrop-blur-sm border-b border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-green-400">
                AI Interviewer
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-green-500/10 px-4 py-2 rounded-full border border-green-500">
                <User className="h-5 w-5 mr-2 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  {name}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-colors duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            Welcome back, {name}!
          </h1>
          <p className="text-xl text-green-300 max-w-2xl mx-auto leading-relaxed">
            Ready to ace your next interview? Let's create personalized
            questions tailored to your dream job.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto bg-gray-800 border border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-gray-900 rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Brain className="w-7 h-7" />
              Interview Setup
            </CardTitle>
            <CardDescription className="text-green-900 text-lg">
              Fill in the details below to generate AI-powered interview
              questions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="jobPosition"
                    className="text-lg font-semibold text-green-400 flex items-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Job Position
                  </Label>
                  <Input
                    id="jobPosition"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    className="h-12 text-lg bg-gray-700 border-2 border-green-500 text-green-100 focus:border-green-400 transition-colors duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="timeDuration"
                    className="text-lg font-semibold text-green-400 flex items-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Time Duration
                  </Label>
                  <select
                    id="timeDuration"
                    value={timeDuration}
                    onChange={(e) => setTimeDuration(e.target.value)}
                    required
                    className="h-12 w-full bg-gray-700 border-2 border-green-500 rounded-md px-3 text-lg text-green-100 focus:border-green-400 transition-colors duration-300"
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="interviewType"
                  className="text-lg font-semibold text-green-400 flex items-center gap-2"
                  >
                  <Target className="w-5 h-5" />
                  Interview Type
                </Label>
                <select
                  id="interviewType"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  required
                  className="h-12 w-full bg-gray-700 border-2 border-green-500 rounded-md px-3 text-lg text-green-100 focus:border-green-400 transition-colors duration-300"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="problem solving">Problem Solving</option>
                </select>
              </div>

             
              <div className="space-y-3">
                <Label
                  htmlFor="jobDescription"
                  className="text-lg font-semibold text-green-400 flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Job Description
                </Label>

                <FileUpload
                  onFileProcessed={setJobDescription}
                  disabled={loading}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-green-500" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800 px-2 text-green-400">
                      Or enter text manually
                    </span>
                  </div>
                </div>

                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste or type the job description here. Include requirements, responsibilities, and any specific skills mentioned..."
                  className="min-h-[150px] text-lg bg-gray-700 border-2 border-green-500 text-green-100 focus:border-green-400 transition-colors duration-300"
                  required
                />
              </div>

              {loading && (
                <div className="bg-green-500/10 p-6 rounded-xl border border-green-500">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                      <div className="absolute inset-0 w-8 h-8 border-2 border-green-300 rounded-full animate-pulse"></div>
                    </div>
                    <span className="ml-3 text-lg font-semibold text-green-400">
                      Generating AI Questions...
                    </span>
                  </div>
                  <progress
                    value={0}
                    className="w-full h-3 mb-3"
                  />

                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-green-400">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce mr-2"></div>
                      Processing
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-200 mr-2"></div>
                      Crafting Questions
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce animation-delay-400 mr-2"></div>
                      Finalizing
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Interview Questions
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-green-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              AI-Powered
            </h3>
            <p className="text-green-300">
              Advanced AI generates relevant questions based on your job
              description
            </p>
          </div>
          <div className="text-center p-6 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-green-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Personalized
            </h3>
            <p className="text-green-300">
              Tailored questions specific to your role and industry
            </p>
          </div>
          <div className="text-center p-6 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-green-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Time-Efficient
            </h3>
            <p className="text-green-300">
              Quick generation of comprehensive interview questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;