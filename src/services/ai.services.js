import { GoogleGenAI } from '@google/genai';
import * as z from "zod";
import puppeteer from 'puppeteer'

const interviewReportSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
      description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
    },
    technicalQuestions: {
      type: "array",
      description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The technical question can be asked in the interview" },
          intention: { type: "string", description: "The intention of interviewer behind asking this question" },
          answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
        }
      }
    },
    behavioralQuestions: {
      type: "array",
      description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The behavioral question can be asked in the interview" },
          intention: { type: "string", description: "The intention of interviewer behind asking this question" },
          answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
        }
      }
    },
    skillGaps: {
      type: "array",
      description: "List of skill gaps in the candidate's profile along with their severity",
      items: {
        type: "object",
        properties: {
          skill: { type: "string", description: "The skill which the candidate is lacking" },
          severity: { type: "string", enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
        }
      }
    },
    preparationPlan: {
      type: "array",
      description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
      items: {
        type: "object",
        properties: {
          day: { type: "number", description: "The day number in the preparation plan, starting from 1" },
          focus: { type: "string", description: "The main focus of this day in the preparation plan" },
          tasks: {
            type: "array",
            description: "List of tasks to be done on this day",
            items: { type: "string" }
          }
        }
      }
    },
    title: {
      type: "string",
      description: "The title of the job for which the interview report is generated"
    }
  }
}
 const resumePdfSchema={
    type:"object",
    properties:{
      html:{type: "string", description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer"},
    }
  }
const interviewSchema = z.fromJSONSchema(interviewReportSchema);
const resumeSchema = z.fromJSONSchema(resumePdfSchema);
const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Generate an interview report for a candidate with the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}`;

 const response = await client.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: prompt + "\n\nReturn only valid JSON strictly matching the schema. Do not repeat words or add extra text.",
  config: {
    responseMimeType: "application/json",
    responseSchema: interviewReportSchema
  }
});
 
const text = response.candidates[0].content.parts[0].text;
const report = interviewSchema.parse(JSON.parse(text));
  // console.log(report);
  return report;
}
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

export const generateResumePdf= async({resume,jobDescription,selfDescription})=>{
   const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `
                     const response = await client.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: prompt + "\n\nReturn only valid JSON strictly matching the schema. Do not repeat words or add extra text.",
  config: {
    responseMimeType: "application/json",
    responseSchema: resumePdfSchema
  }
});

 
const text = response.candidates[0].content.parts[0].text;
const generatedHtml = resumeSchema.parse(JSON.parse(text));
const pdfBuffer = await generatePdfFromHtml(generatedHtml.html)

    return pdfBuffer
 

}


export default generateInterviewReport;

