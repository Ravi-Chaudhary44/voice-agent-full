
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Vapi from "@vapi-ai/web";

export const useVapi = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'assistant' | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const jobDescription = localStorage.getItem('jobDescription');
    if (!jobDescription) {
      navigate('/dashboard');
      return;
    }

    const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY); // Replace with your actual Vapi public key
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Interview Started",
        description: "The AI interviewer is now ready to begin.",
      });
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsLoading(false);
      toast({
        title: "Interview Ended",
        description: "Redirecting to feedback page...",
      });
     

      setTimeout(() => navigate('/feedback'), 2000);
    });

    vapi.on('speech-start', () => {
      console.log('Speech started');
      setCurrentSpeaker('user');
    });

    vapi.on('speech-end', () => {
      console.log('Speech ended');
      setCurrentSpeaker(null);
    });

    vapi.on('message', (message) => {
      console.log('Message:', message);
      if (message.type === 'transcript') {
        const newTranscript = `${message.role}: ${message.transcript}`;
        setTranscript(prev => [...prev, newTranscript]);
      }
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description: "There was an issue with the voice connection. Please try again.",
        variant: "destructive",
      });
    });

    return () => {
     
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [navigate, toast]);

  const startInterview = async () => {
    if (!vapiRef.current) return;

    setIsLoading(true);
    const jobDescription = localStorage.getItem('jobDescription');

    try {
      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
  {
    role: "system",
    content: `You are an AI interviewer created  Always stay in interviewer mode.

    Conduct a professional interview by:
    1. Starting with a warm greeting and introduction
    2. Asking relevant questions based on the job description
    3. Following up on responses naturally
    4. Keep questions concise and clear
    5. End the interview after 5-7 questions by thanking the candidate

    Be conversational, professional, and encouraging. Ask one question at a time and wait for responses.`
  }
]
        },
        voice: {
          provider: "11labs",
          voiceId: "EXAVITQu4vr4xnSDxMaL"
        }
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      setIsLoading(false);
      toast({
        title: "Failed to Start",
        description: "Could not start the interview. Please check your configuration.",
        variant: "destructive",
      });
    }
  };

  const endInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  return {
    isConnected,
    isLoading,
    transcript,
    currentSpeaker,
    startInterview,
    endInterview
  };
};