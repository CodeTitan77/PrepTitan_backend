import OpenAI from 'openai';
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

const resumePdfSchema = {
  type: "object",
  properties: {
    html: { type: "string", description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer" },
  }
}

const interviewSchema = z.fromJSONSchema(interviewReportSchema);
const resumeSchema = z.fromJSONSchema(resumePdfSchema);

const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `You are a senior hiring manager and career coach with 10+ years of experience conducting interviews across multiple industries including technology, law, finance, healthcare, and business. Your job is to create a highly personalized and actionable interview preparation report for any role.

CANDIDATE PROFILE:
Resume: ${resume}
Self Description: ${selfDescription}

TARGET JOB:
${jobDescription}

YOUR TASK:
Carefully analyze the candidate's background against the job requirements and generate a detailed, role-specific interview report with the following strict requirements:

TECHNICAL QUESTIONS (generate exactly 5):
- Questions must be directly relevant to the skills, tools, and knowledge required for this specific role
- Questions should test both theoretical understanding and practical application
- Range from intermediate to advanced difficulty
- Must be specific to the industry and role — not generic
- For tech roles: include system design, coding, and architecture questions
- For non-tech roles: include domain knowledge, case studies, and situational questions

BEHAVIORAL QUESTIONS (generate exactly 4):
- Questions must reference specific experiences, projects, or achievements from the candidate's profile
- Use STAR method friendly questions (Situation, Task, Action, Result)
- Cover teamwork, conflict resolution, leadership, and adaptability
- Tailor tone and context to the industry of the role

SKILL GAPS (generate at least 3):
- Identify genuine gaps between what the candidate has and what the job requires
- Be specific — name the exact skill, tool, certification, or experience that is missing
- Assign severity accurately:
  - high = critical for the role, will likely be a dealbreaker
  - medium = important but can be developed with preparation
  - low = nice to have, won't heavily impact hiring decision

PREPARATION PLAN (generate exactly 7 days):
- Each day must have a focused theme based on the identified gaps and role requirements
- Each day must have at least 3 specific, actionable tasks
- Tasks should be practical — reference concepts, resources, or exercises relevant to the role
- Plan should progressively build from foundational to advanced preparation
- Last 1-2 days should focus on mock interviews and confidence building

MATCH SCORE:
- Calculate honestly based on how well the candidate's profile aligns with the job requirements
- 80-100: Strong match, minor gaps only
- 60-79: Good match, some focused preparation needed
- 40-59: Moderate match, significant upskilling required
- Below 40: Weak match, major gaps exist

TITLE: Extract the exact job title from the job description.

Return ONLY valid JSON matching this schema, no markdown, no explanation, no extra text:
${JSON.stringify(interviewReportSchema, null, 2)}`

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const text = response.choices[0].message.content;
  const report = interviewSchema.parse(JSON.parse(text));
  return report;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm"
    }
  })

  await browser.close()
  return pdfBuffer
}

export const generateResumePdf = async ({ resume, jobDescription, selfDescription }) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

Return ONLY valid JSON with a single "html" field, nothing else.`

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const text = response.choices[0].message.content;
  const generatedHtml = resumeSchema.parse(JSON.parse(text));
  const pdfBuffer = await generatePdfFromHtml(generatedHtml.html)
  return pdfBuffer
}

export default generateInterviewReport;