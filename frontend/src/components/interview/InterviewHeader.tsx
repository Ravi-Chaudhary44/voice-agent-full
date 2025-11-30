
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft } from "lucide-react";

interface InterviewHeaderProps {
  isConnected: boolean;
}

export const InterviewHeader = ({ isConnected }: InterviewHeaderProps) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <MessageSquare className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">Live AI Interview</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? "default" : "outline"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
};
