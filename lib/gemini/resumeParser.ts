// lib/gemini/resumeParser.ts
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.0-flash";

// Initialize the GenAI client
let ai: GoogleGenAI;

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
      endDate?: string | null;
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

function initializeGenAI() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Please add GOOGLE_GEMINI_API_KEY to your .env.local file."
    );
  }

  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }
  return ai;
}

export async function parseResumeWithGemini(
  fileBuffer: Buffer,
  fileName: string
): Promise<ResumeData> {
  initializeGenAI();

  try {
    // Extract text from the file first
    const extractedText = await extractTextFromBuffer(fileBuffer, fileName);

    if (!extractedText.trim()) {
      throw new Error("Could not extract text from the resume file");
    }

    console.log("Extracted text length:", extractedText.length);

    // Parse text with Gemini
    return await parseTextWithGemini(extractedText, fileName);
  } catch (error: any) {
    console.error("Gemini parsing error:", error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

async function parseTextWithGemini(
  text: string,
  fileName: string
): Promise<ResumeData> {
  const prompt = `You are a professional resume parser. Extract structured information from this resume.

RESUME CONTENT:
${text.substring(0, 15000)}  // Reduced for safety

Return ONLY valid JSON with this exact structure:
{
  "name": "Full name if found",
  "email": "Email address if found",
  "phone": "Phone number if found",
  "summary": "Professional summary or objective",
  "skills": ["list", "of", "skills", "mentioned"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "current": true/false,
      "description": "Job description"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University name",
      "fieldOfStudy": "Field of study",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "current": true/false
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "YYYY-MM or YYYY"
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Proficiency level"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text. If a field is not found, use empty string for strings, empty array for arrays, or null where appropriate.`;

  try {
    console.log("Calling Gemini API with model:", GEMINI_MODEL);

    // Minimal, correct SDK structure
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      },
    });

    console.log("Gemini API response received");

    if (!response.text) {
      console.error("No text in response:", response);
      throw new Error("No content received from Gemini API");
    }

    console.log(
      "Raw Gemini response (first 500 chars):",
      response.text.substring(0, 500)
    );

    // Clean and parse the JSON response
    const cleanedContent = response.text
      .replace(/```json\s*|\s*```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error(
        "Failed to parse AI response as JSON. Raw content (first 1000 chars):",
        cleanedContent.substring(0, 1000)
      );

      // Try to extract JSON from malformed response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log("Successfully extracted JSON from response");
        } catch {
          throw new Error("Could not parse AI response as JSON");
        }
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    }

    console.log("Successfully parsed resume data");

    // Validate and sanitize the parsed data
    const sanitizedData = {
      name: parsedData.name || "",
      email: parsedData.email || "",
      phone: parsedData.phone || "",
      summary: parsedData.summary || "",
      skills: Array.isArray(parsedData.skills)
        ? parsedData.skills.filter(Boolean)
        : [],
      experience: Array.isArray(parsedData.experience)
        ? parsedData.experience.map((exp: any) => ({
            title: exp.title || "",
            company: exp.company || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || null,
            current: Boolean(exp.current),
            description: exp.description || "",
          }))
        : [],
      education: Array.isArray(parsedData.education)
        ? parsedData.education.map((edu: any) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || null,
            current: Boolean(edu.current),
          }))
        : [],
      certifications: Array.isArray(parsedData.certifications)
        ? parsedData.certifications.map((cert: any) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
          }))
        : [],
      languages: Array.isArray(parsedData.languages)
        ? parsedData.languages.map((lang: any) => ({
            language: lang.language || "",
            proficiency: lang.proficiency || "",
          }))
        : [],
    };

    return {
      extractedText: text,
      structuredData: sanitizedData,
    };
  } catch (error: any) {
    console.error("Gemini API error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    });

    // Try with a fallback model if the primary fails
    if (error.message?.includes("model") || error.code === 404) {
      console.log("Trying with fallback model gemini-1.5-flash...");
      return await parseTextWithFallbackModel(text, fileName, prompt);
    }

    throw new Error(`Gemini API error: ${error.message}`);
  }
}

async function parseTextWithFallbackModel(
  text: string,
  fileName: string,
  prompt: string
): Promise<ResumeData> {
  try {
    console.log("Trying with fallback model: gemini-1.5-flash");

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      },
    });

    if (!response.text) {
      throw new Error("No content received from Gemini API");
    }

    // Clean and parse the JSON response
    const cleanedContent = response.text
      .replace(/```json\s*|\s*```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse fallback response as JSON");
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in fallback response");
      }
    }

    // Validate and sanitize the parsed data
    const sanitizedData = {
      name: parsedData.name || "",
      email: parsedData.email || "",
      phone: parsedData.phone || "",
      summary: parsedData.summary || "",
      skills: Array.isArray(parsedData.skills)
        ? parsedData.skills.filter(Boolean)
        : [],
      experience: Array.isArray(parsedData.experience)
        ? parsedData.experience.map((exp: any) => ({
            title: exp.title || "",
            company: exp.company || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || null,
            current: Boolean(exp.current),
            description: exp.description || "",
          }))
        : [],
      education: Array.isArray(parsedData.education)
        ? parsedData.education.map((edu: any) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || null,
            current: Boolean(edu.current),
          }))
        : [],
      certifications: Array.isArray(parsedData.certifications)
        ? parsedData.certifications.map((cert: any) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
          }))
        : [],
      languages: Array.isArray(parsedData.languages)
        ? parsedData.languages.map((lang: any) => ({
            language: lang.language || "",
            proficiency: lang.proficiency || "",
          }))
        : [],
    };

    return {
      extractedText: text,
      structuredData: sanitizedData,
    };
  } catch (fallbackError) {
    console.error("Fallback model also failed:", fallbackError);
    throw fallbackError;
  }
}

// Simple text extraction functions
async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const extension = fileName.toLowerCase().split(".").pop();

  try {
    if (extension === "pdf") {
      return await extractTextFromPDF(buffer);
    } else if (extension === "txt") {
      return buffer.toString("utf-8");
    } else {
      return extractTextFromBinary(buffer);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
    return extractTextFromBinary(buffer);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Simple text extraction for now
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 1000000));

    // Extract readable text
    const readableText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return readableText.substring(0, 20000);
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "PDF text extraction failed";
  }
}

function extractTextFromBinary(buffer: Buffer): string {
  try {
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 500000));

    const printableText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return printableText.substring(0, 20000);
  } catch (error) {
    console.error("Binary text extraction error:", error);
    return "Text extraction failed";
  }
}

// Export a simple text extraction function
export async function extractResumeText(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  return extractTextFromBuffer(fileBuffer, fileName);
}
