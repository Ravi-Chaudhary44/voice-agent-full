import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, User, Mic ,AlertCircle} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useGoogleLogin } from "@react-oauth/google";
import {googleAuth} from '../api'
const Index = () => {
  
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        if(codeResponse['code']){
          const result=await googleAuth(codeResponse['code']);
          if (!result.data || !result.data.user) {
  console.error("No user data received:", result.data);
  return;
          }
          const {email,name,image}=result.data.user;
          console.log('result.data.user---',result.data.user);
        }
        
      } catch (error) {
  console.error(
    "Error while handling Google code:",
    error?.response?.data || error?.message || JSON.stringify(error) || "Unknown error"
  );
}

    },
    onError: (error) => {
      console.error("Google login failed:", error);
    },
  });

  return (
    <>
    <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 border-b-2 border-orange-300 py-3 overflow-hidden shadow-lg">
  <div className="whitespace-nowrap animate-marquee">
    <span className="text-white font-bold text-base flex items-center gap-2 drop-shadow-sm">
      <AlertCircle className="h-5 w-5 animate-pulse" />
      🚨 Google login is currently unavailable. Please register and log in manually for the best experience! 🚨
      <AlertCircle className="h-5 w-5 animate-pulse" />
    </span>
  </div>
</div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center">
          <div className="text-center">
            <div className="flex flex-col justify-center items-center lg:py-5">
              <img src="./login.png" width={600} height={400} alt="Login" />
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-0 my-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:py-7 px-6">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Interview
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>

             
                <Button
                  onClick={() => googleLogin()}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <img
                    src="./google.png"
                    alt="Google logo"
                    className="w-5 h-5"
                  />
                  Login with Google
                </Button>
              </div>
            </div>
          </div>
        </div>

       
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl hover:border-blue-600 border border-transparent">
            <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Generated Questions</h3>
            <p className="text-gray-600">
              Get personalized interview questions based on your job description using advanced AI
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl hover:border-blue-600 border border-transparent">
            <Mic className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Voice Integration</h3>
            <p className="text-gray-600">
              Practice with voice-to-voice interaction for a realistic interview experience
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl hover:border-blue-600 border border-transparent">
            <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Detailed Feedback</h3>
            <p className="text-gray-600">
              Receive comprehensive feedback on your responses and areas for improvement
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
