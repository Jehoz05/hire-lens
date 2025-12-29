import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export interface ResumeSuggestions {
  improvements: string[];
  missingKeywords: string[];
  formatSuggestions: string[];
  contentSuggestions: string[];
  score: number;
  industryInsights: string[];
}

export async function getResumeSuggestions(
  resumeText: string,
  targetJobTitle?: string,
  targetIndustry?: string
): Promise<ResumeSuggestions> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  try {
    let prompt = `Analyze this resume and provide improvement suggestions:\n\n${resumeText}`;
    
    if (targetJobTitle) {
      prompt += `\n\nTarget Job Title: ${targetJobTitle}`;
    }
    
    if (targetIndustry) {
      prompt += `\n\nTarget Industry: ${targetIndustry}`;
    }

    prompt += `
      Provide a comprehensive analysis with:
      1. Specific improvements needed
      2. Missing keywords for ATS (Applicant Tracking Systems)
      3. Format suggestions
      4. Content suggestions
      5. Overall score (0-100)
      6. Industry-specific insights
      
      Return as JSON:
      {
        "improvements": string[],
        "missingKeywords": string[],
        "formatSuggestions": string[],
        "contentSuggestions": string[],
        "score": number,
        "industryInsights": string[]
      }
    `;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer and career coach.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error: any) {
    console.error('DeepSeek suggestions error:', error);
    throw new Error(`Failed to get suggestions: ${error.message}`);
  }
}