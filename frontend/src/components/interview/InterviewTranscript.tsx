
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterviewTranscriptProps {
  transcript: string[];
}

export const InterviewTranscript = ({ transcript }: InterviewTranscriptProps) => {
  if (transcript.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcript.map((line, index) => {
            const [speaker, ...messageParts] = line.split(': ');
            const message = messageParts.join(': ');
            const isAssistant = speaker.toLowerCase().includes('assistant') || speaker.toLowerCase().includes('ai');
            
            return (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  isAssistant 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'bg-gray-50 border-l-4 border-gray-500'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <Badge variant={isAssistant ? "default" : "outline"} className="text-xs">
                    {isAssistant ? "AI Interviewer" : "You"}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-800">{message}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
