
import { Card, CardContent } from "@/components/ui/card";

export const InterviewInstructions = () => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div className="text-center text-gray-600">
          <h3 className="font-semibold mb-2">How It Works:</h3>
          <ul className="text-sm space-y-1">
            <li>1. Click "Start Interview" to begin the voice session</li>
            <li>2. The AI interviewer will greet you and ask questions</li>
            <li>3. Speak naturally - the AI will listen and respond</li>
            <li>4. The interview will end automatically after 5-7 questions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
