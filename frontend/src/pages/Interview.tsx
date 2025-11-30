import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { Mic, Phone, Clock, Loader2 } from "lucide-react";

const InterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const vapiRef = useRef<Vapi | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [vapiStatus, setVapiStatus] = useState("idle");
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [name, setName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [agentTranscript, setAgentTranscript] = useState("");
  const [userTranscript, setUserTranscript] = useState("");

 
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera API not supported on this browser/device.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        alert("Camera error: " + err.name + " - " + err.message);
        console.error("Camera error:", err);
      });
  }, []);


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

 
  const saveAnswers = async () => {
    const token = localStorage.getItem("token");
    if (!sessionId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/interview/answer/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ answers }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        console.log("Error while sending answers");
      }
      console.log("Answers saved successfully");
    } catch (err) {
      console.error("Failed to save answers:", err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("token");
      if (!sessionId) {
        setLoadingError("Session ID is missing in the URL.");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/api/interview/get/${sessionId}`,
          { 
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            credentials: "include" 
          }
        );
        const data = await response.json();
        if (!data?.data?.details) throw new Error("Missing session details");
        setSession(data.data);

        const qs =
          data.data.questions ||
          data.data.details.question?.questions ||
          data.data.details.question ||
          [];

        const username =
          data.data.fullName ||
          data.data.user.fullName?.fullName ||
          data.data.user.fullName;
        setName(username);

        setQuestions(Array.isArray(qs) ? qs : []);
      } catch (err: any) {
        setLoadingError(err.message);
      }
    };
    fetchSession();
  }, [sessionId]);

  
  const handleInterviewEnd = async () => {
    setIsProcessing(true); 
    
    try {
      await saveAnswers();
      
    
      setTimeout(() => {
        navigate(`/results/${sessionId}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error ending interview:", error);
      setIsProcessing(false);
    }
  };

  
  useEffect(() => {
    if (vapiStatus === "ended" || vapiStatus === "error") {
      stopCamera();
      handleInterviewEnd();
    }
  }, [vapiStatus]);

  useEffect(() => {
    if (!session || questions.length === 0) return;

    const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!PUBLIC_KEY) {
      setLoadingError("VAPI public API key is missing");
      return;
    }

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;
    setVapiStatus("initializing");

    vapi.on("call-start", () => {
      setIsCallActive(true);
      setVapiStatus("active");
    });

    vapi.on("call-end", () => {
      console.log("Call has ended ✅");
      setIsCallActive(false);
      setVapiStatus("ended");
    });

    vapi.on("error", (err: any) => {
      console.error("Vapi error:", err);
      setLoadingError(err.message || JSON.stringify(err));
      setVapiStatus("error");
    });

   
    vapi.on("message", (msg: any) => {
      if (
        msg.type === "transcript" &&
        msg.transcriptType === "final" &&
        typeof msg.transcript === "string"
      ) {
        if (msg.role === "assistant") {
          setAgentTranscript(msg.transcript);

        
          const currentQuestion = questions[currentQuestionIndex]?.question;
          if (currentQuestion && msg.transcript.includes(currentQuestion)) {
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            );
          }
        } else if (msg.role === "user") {
          setUserTranscript(msg.transcript);

          
          if (currentQuestionIndex < questions.length) {
            const newAnswer = {
              questionIndex: currentQuestionIndex,
              answer: msg.transcript,
              timestamp: new Date(),
            };

            setAnswers((prev) => [...prev, newAnswer]);
          }
        }
      }
    });

    const jobPosition = session.details.jobposition || "the position";
    const questionList = questions
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");

    vapi.start({
      name: "AI Recruiter",
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
You are an AI voice assistant conducting interviews.
Begin with a friendly intro:
"Hey ${name}! Welcome to your ${jobPosition} interview."
Ask one question at a time from this list:
${questionList}
Offer hints if needed.
Encourage after answers.
Wrap up after all questions:
"Thanks for chatting! Hope to see you crushing projects soon!"
            `.trim(),
          },
        ],
      },
    });

    return () => {
      if (vapiRef.current) vapiRef.current.stop();
    };
  }, [session, questions, navigate, sessionId, name]);

  const handleEndCall = () => {
    setIsCallActive(false);
    stopCamera();
    vapiRef.current?.stop();
    handleInterviewEnd();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };


  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-green-400">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-green-500 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-green-300 rounded-full animate-pulse mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-green-400">
            Processing Your Interview
          </h2>
          <p className="text-green-300 max-w-md">
            We're analyzing your responses and generating detailed feedback...
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 p-8 text-center">
        <h2 className="text-xl font-bold">Error Loading Session</h2>
        <p>{loadingError}</p>
        <Button onClick={() => window.location.reload()} className="bg-red-500 text-gray-900 hover:bg-red-400">
          Try Again
        </Button>
      </div>
    );
  }

  if (!session) {
    return <div className="min-h-screen bg-gray-900 text-green-400 p-8 text-center">Loading interview session…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-100">
    
      <div className="flex items-center justify-between p-6 bg-gray-800/80 backdrop-blur-sm border-b border-green-500">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-semibold text-green-400">
            C Interviewer
          </span>
        </div>
        <h1 className="text-xl font-semibold text-green-400">
          AI Interview Session
        </h1>
        <div className="flex items-center space-x-2 text-green-400">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
        </div>
      </div>
      
     
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           
            <div className="bg-gray-800 rounded-2xl border border-green-500 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img
                      src="/Ai.gif"
                      alt="AI Recruiter"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-green-400">
                    AI Recruiter
                  </h3>
                </div>
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-2 bg-green-500 text-gray-900 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
                    <span>{isCallActive ? "Active" : "Idle"}</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
                  {agentTranscript && (
                    <div className="inline-block bg-gray-800/80 border border-green-500 px-4 py-2 rounded text-green-400 text-lg font-medium">
                      {agentTranscript}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            
            <div className="bg-gray-800 rounded-2xl border border-green-500 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                <div className="text-center w-full h-full flex flex-col items-center justify-center">
                 
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-40 h-40 object-cover rounded-full mx-auto mb-4 bg-black border-2 border-green-500"
                    style={{ background: "#111", borderRadius: "50%" }}
                  />
                  <h3 className="text-lg font-semibold text-green-400">
                    {name}
                  </h3>
                </div>
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-2 bg-green-500 text-gray-900 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
                    <span>Connected</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
                  {userTranscript && (
                    <div className="inline-block bg-gray-800/80 border border-green-500 px-4 py-2 rounded text-green-400 text-lg font-medium">
                      {userTranscript}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        
          <div className="flex justify-center space-x-6">
            <Button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              <Mic className="w-6 h-6" />
            </Button>
            <Button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>

         
          <div className="text-center mt-8">
            <p className="text-green-300 text-lg">
              {isCallActive
                ? "Interview in Progress..."
                : vapiStatus === "ended"
                  ? "Interview Ended"
                  : vapiStatus === "error"
                    ? "Error in Interview"
                    : "Ready to start"}
            </p>
            <p className="text-sm mt-2 text-green-400">
              Current Question: {currentQuestionIndex + 1}/{questions.length}
            </p>
          </div>

         
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-green-500">
              <h2 className="text-xl font-semibold text-green-400 mb-4">Job Details</h2>
              <div className="space-y-2 text-green-300">
                <p>
                  <strong>Position:</strong> {session.details.jobposition}
                </p>
                <p>
                  <strong>Type:</strong> {session.details.type}
                </p>
                <p>
                  <strong>Duration:</strong> {session.details.timeduration} minutes
                </p>
              </div>
            </div>
          </div>

        
          <div className="mt-8 p-6 bg-yellow-500/10 rounded-xl border border-yellow-500">
            <h3 className="font-semibold text-yellow-400">Debug Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-yellow-300 text-sm mt-2">
              <div>Session ID: {sessionId}</div>
              <div>Questions loaded: {questions.length}</div>
              <div>Current Question Index: {currentQuestionIndex}</div>
              <div>Answers captured: {answers.length}</div>
              <div>VAPI Status: {vapiStatus}</div>
              <div>Call Active: {isCallActive ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;