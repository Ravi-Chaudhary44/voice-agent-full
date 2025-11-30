
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff, Mic } from "lucide-react";

interface InterviewControlsProps {
  isConnected: boolean;
  isLoading: boolean;
  currentSpeaker: 'user' | 'assistant' | null;
  onStartInterview: () => void;
  onEndInterview: () => void;
}

export const InterviewControls = ({
  isConnected,
  isLoading,
  currentSpeaker,
  onStartInterview,
  onEndInterview
}: InterviewControlsProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Voice Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <p className="text-gray-600 text-lg">
            Ready to start your live voice interview? Click the button below to begin speaking with the AI interviewer.
          </p>
          
          <div className="flex justify-center">
            {!isConnected ? (
              <Button 
                onClick={onStartInterview}
                disabled={isLoading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Phone className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Connecting..." : "Start Interview"}
              </Button>
            ) : (
              <Button 
                onClick={onEndInterview}
                size="lg"
                variant="destructive"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Interview
              </Button>
            )}
          </div>

          {/* Status Indicator */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
              {currentSpeaker === 'user' && (
                <div className="flex items-center">
                  <Mic className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">You're speaking</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};