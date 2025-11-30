export const QUESTIONS_PROMPT = `You are an expert technical interviewer.  
Based on the following inputs, generate a well-structured list of high-quality interview questions:  

Job Title: {{jobTitle}}  
Job Description: {{jobDescription}}  
Interview Duration: {{duration}} minutes  
Interview Type: {{type}}  

Your task:  
- Analyze the job description to identify key responsibilities, required skills, and expected experience  
- Always begin with an introductory question like "Can you briefly introduce yourself and your background?"  
- Generate exactly 7 interview questions matching the duration  
- Ensure questions match a real-life {{type}} interview  
- NEVER include markdown code blocks or explanations  
- Output ONLY valid JSON with this structure:  
{  
  "questions": [  
    {  
      "question": "Full question text here",  
      "type": "Technical/Behavioral/Experience"  
    }  
  ]  
}  

Example output:  
{  
  "questions": [  
    {"question": "Can you briefly introduce yourself and your background?", "type": "Experience"},  
    {"question": "How would you solve...", "type": "Technical"}  
  ]  
}`;  
 


export const FEEDBACK_PROMPT = `{{conversation}}
Based on this Interview Conversation between assistant and user,
Provide comprehensive feedback including:
1. Ratings out of 10 for:
   - Technical Skills
   - Communication
   - Problem Solving
   - Experience
2. Key strengths demonstrated by the candidate
3. Areas for improvement
4. A 3-line summary of the interview
5. Hiring recommendation with justification

Response format (JSON):
{
  "feedback": {
    "rating": {
      "technicalSkills": 5,
      "communication": 6,
      "problemSolving": 4,
      "experience": 7
    },
    "strengths": ["List 3-5 key strengths", "e.g., Strong technical fundamentals"],
    "improvements": ["List 3-5 areas for growth", "e.g., Could improve problem explanation"],
    "summary": "3-line interview summary",
    "recommendation": "Yes/No",
    "recommendationMsg": "One-line justification"
  }
}`
;
