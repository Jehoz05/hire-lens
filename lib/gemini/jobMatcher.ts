import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-pro";

export interface MatchingResult {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  missingSkills: string[];
  recommendedJobs: Array<{
    title: string;
    matchScore: number;
    reason: string;
  }>;
}

export async function matchResumeToJobs(
  resumeText: string,
  jobDescriptions: Array<{
    title: string;
    description: string;
    requirements: string[];
  }>
): Promise<MatchingResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("DeepSeek API key is not configured");
  }

  try {
    const prompt = `
      Resume: ${resumeText}
      
      Jobs to match against:
      ${jobDescriptions
        .map(
          (job, i) => `
        Job ${i + 1}: ${job.title}
        Description: ${job.description}
        Requirements: ${job.requirements.join(", ")}
      `
        )
        .join("\n")}
      
      Analyze this resume against the jobs and provide:
      1. Overall match score (0-100)
      2. Strengths (what matches well)
      3. Weaknesses (what's missing)
      4. Suggestions for improvement
      5. List of missing skills
      6. For each job, provide:
         - Match score (0-100)
         - Reason for the score
      
      Return as JSON:
      {
        "score": number,
        "feedback": {
          "strengths": string[],
          "weaknesses": string[],
          "suggestions": string[]
        },
        "missingSkills": string[],
        "recommendedJobs": [{
          "title": string,
          "matchScore": number,
          "reason": string
        }]
      }
    `;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        model: "gemini-chat",
        messages: [
          {
            role: "system",
            content: "You are a career advisor and job matching expert.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      },
      {
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error: any) {
    console.error("Gemini matching error:", error);
    throw new Error(`Failed to match resume: ${error.message}`);
  }
}
