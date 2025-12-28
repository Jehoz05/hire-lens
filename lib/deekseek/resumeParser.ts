import axios from 'axios';
import { PDFParser } from 'pdf2json';

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

export async function parseResumeWithDeepSeek(fileBuffer: Buffer, fileName: string): Promise<ResumeData> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API key is not configured. Using mock data for development.');
    return getMockResumeData(fileName);
  }

  try {
    // Extract text from the file buffer
    const extractedText = await extractTextFromBuffer(fileBuffer, fileName);
    
    if (!extractedText.trim()) {
      throw new Error('Could not extract text from the resume file');
    }

    const prompt = `Analyze this resume and extract structured information. Return ONLY valid JSON, no other text.

RESUME CONTENT:
${extractedText}

Extract this information and return as JSON with this exact structure:
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

IMPORTANT: 
- If a field is not found in the resume, use empty string for strings, empty array for arrays, or null where appropriate.
- Dates should be standardized to YYYY-MM format if possible, otherwise YYYY.
- For current positions/education, set "current": true and "endDate": null.`;

    const response = await axios.post(
      `${DEEPSEEK_API_URL}/v1/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume parser. Extract structured data from resumes. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No content received from DeepSeek API');
    }

    const content = response.data.choices[0].message.content;
    
    // Clean and parse the JSON response
    const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON. Raw content:', cleanedContent);
      // Try to extract JSON from malformed response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Could not parse AI response as JSON');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Validate and sanitize the parsed data
    const sanitizedData = {
      name: parsedData.name || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      summary: parsedData.summary || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills.filter(Boolean) : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((exp: any) => ({
        title: exp.title || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || null,
        current: Boolean(exp.current),
        description: exp.description || ''
      })) : [],
      education: Array.isArray(parsedData.education) ? parsedData.education.map((edu: any) => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || null,
        current: Boolean(edu.current)
      })) : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications.map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || ''
      })) : [],
      languages: Array.isArray(parsedData.languages) ? parsedData.languages.map((lang: any) => ({
        language: lang.language || '',
        proficiency: lang.proficiency || ''
      })) : []
    };

    return {
      extractedText,
      structuredData: sanitizedData,
    };
  } catch (error: any) {
    console.error('DeepSeek parsing error:', error);
    
    // On error, extract basic info from text and return partial data
    try {
      const extractedText = await extractTextFromBuffer(fileBuffer, fileName);
      return {
        extractedText,
        structuredData: extractBasicInfo(extractedText),
      };
    } catch (fallbackError) {
      console.error('Fallback parsing also failed:', fallbackError);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }
}

async function extractTextFromBuffer(buffer: Buffer, fileName: string): Promise<string> {
  const extension = fileName.toLowerCase().split('.').pop();
  
  try {
    if (extension === 'pdf') {
      return await extractTextFromPDF(buffer);
    } else if (extension === 'txt') {
      return buffer.toString('utf-8');
    } else if (extension === 'docx' || extension === 'doc') {
      // For Word documents, you would need a different library
      // For now, try to extract as text
      return extractTextFromBinary(buffer);
    } else {
      // Try general text extraction
      return extractTextFromBinary(buffer);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
    throw new Error(`Could not extract text from ${fileName}`);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    let extractedText = '';
    
    pdfParser.on('pdfParser_dataError', (error: any) => {
      console.error('PDF parsing error:', error);
      reject(new Error(`PDF parsing failed: ${error.parserError}`));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extract text from all pages
        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
          for (const page of pdfData.Pages) {
            if (page.Texts && Array.isArray(page.Texts)) {
              for (const textItem of page.Texts) {
                if (textItem.R && Array.isArray(textItem.R)) {
                  for (const r of textItem.R) {
                    if (r.T) {
                      // Decode URI encoded text
                      try {
                        extractedText += decodeURIComponent(r.T) + ' ';
                      } catch {
                        extractedText += r.T + ' ';
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        // Clean up the extracted text
        extractedText = extractedText
          .replace(/\s+/g, ' ')
          .replace(/\\[rn]/g, ' ')
          .trim();
        
        if (!extractedText) {
          reject(new Error('No text could be extracted from PDF'));
        } else {
          resolve(extractedText);
        }
      } catch (error) {
        reject(error);
      }
    });
    
    // Parse the buffer
    pdfParser.parseBuffer(buffer);
  });
}

function extractTextFromBinary(buffer: Buffer): string {
  // Try to extract readable text from binary data
  const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
  
  // Filter out non-printable characters but keep some structure
  const cleanedText = text
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanedText || 'Text extraction failed';
}

function extractBasicInfo(text: string) {
  // Extract basic information using regex patterns
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  
  // Extract skills (common tech keywords)
  const commonSkills = [
    'javascript', 'react', 'node', 'python', 'java', 'typescript', 'html', 'css',
    'aws', 'docker', 'kubernetes', 'mongodb', 'mysql', 'postgresql', 'git',
    'express', 'nestjs', 'nextjs', 'vue', 'angular', 'redux', 'graphql', 'rest',
    'linux', 'ubuntu', 'windows', 'macos', 'agile', 'scrum', 'jira', 'jenkins',
    'ci/cd', 'devops', 'tensorflow', 'pytorch', 'machine learning', 'ai'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill)
  );

  return {
    name: '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    summary: '',
    skills: foundSkills,
    experience: [],
    education: [],
    certifications: [],
    languages: []
  };
}

function getMockResumeData(fileName: string): ResumeData {
  // This is only used when API key is not configured
  return {
    extractedText: `Sample resume content for ${fileName}`,
    structuredData: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      summary: 'Results-driven software engineer with 7+ years of experience in full-stack development and cloud architecture.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Python', 'MongoDB'],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Innovations Inc.',
          startDate: '2020-03-01',
          endDate: null,
          current: true,
          description: 'Lead development of microservices architecture. Mentored junior developers.'
        },
        {
          title: 'Full Stack Developer',
          company: 'Digital Solutions LLC',
          startDate: '2018-06-01',
          endDate: '2020-02-28',
          current: false,
          description: 'Developed and maintained multiple web applications using React and Node.js'
        }
      ],
      education: [
        {
          degree: 'Master of Science in Computer Science',
          institution: 'Stanford University',
          fieldOfStudy: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2018-05-31',
          current: false
        },
        {
          degree: 'Bachelor of Engineering',
          institution: 'MIT',
          fieldOfStudy: 'Software Engineering',
          startDate: '2012-09-01',
          endDate: '2016-05-31',
          current: false
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2021-08-01'
        },
        {
          name: 'Google Cloud Professional Developer',
          issuer: 'Google',
          date: '2020-11-01'
        }
      ],
      languages: [
        {
          language: 'English',
          proficiency: 'Native'
        },
        {
          language: 'Spanish',
          proficiency: 'Fluent'
        },
        {
          language: 'French',
          proficiency: 'Intermediate'
        }
      ]
    }
  };
}

// Export a simple text extraction function for testing
export async function extractResumeText(fileBuffer: Buffer, fileName: string): Promise<string> {
  return extractTextFromBuffer(fileBuffer, fileName);
}