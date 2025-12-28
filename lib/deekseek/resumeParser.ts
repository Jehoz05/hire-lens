import axios from 'axios';

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export interface ResumeData {
  extractedText: string;
  structuredData: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      fieldOfStudy: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };
}

export async function parseResumeWithDeepSeek(fileBuffer: Buffer): Promise<ResumeData> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  try {
    // Convert file buffer to base64
    const base64File = fileBuffer.toString('base64');
    
    // For text-based parsing (assuming we extract text first)
    const extractedText = await extractTextFromBuffer(fileBuffer);
    
    const prompt = `Parse this resume text and extract structured information in JSON format:
    ${extractedText}
    
    Return a JSON object with this structure:
    {
      "name": string,
      "email": string,
      "phone": string,
      "summary": string,
      "skills": string[],
      "experience": [{
        "title": string,
        "company": string,
        "startDate": string,
        "endDate": string,
        "current": boolean,
        "description": string
      }],
      "education": [{
        "degree": string,
        "institution": string,
        "fieldOfStudy": string,
        "startDate": string,
        "endDate": string,
        "current": boolean
      }],
      "certifications": [{
        "name": string,
        "issuer": string,
        "date": string
      }],
      "languages": [{
        "language": string,
        "proficiency": string
      }]
    }`;

    const response = await axios.post(
      `${DEEPSEEK_API_URL}/v1/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parsing assistant. Extract structured information from resumes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const parsedData = JSON.parse(response.data.choices[0].message.content);
    
    return {
      extractedText,
      structuredData: parsedData,
    };
  } catch (error: any) {
    console.error('DeepSeek parsing error:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  // For PDF files, use pdf-parse
  const pdfParse = await import('pdf-parse');
  const data = await pdfParse.default(buffer);
  return data.text;
}