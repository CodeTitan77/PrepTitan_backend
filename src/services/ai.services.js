import { GoogleGenAI } from '@google/genai';
import * as z from "zod";

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
const interviewSchema = z.fromJSONSchema(interviewReportSchema);



async function invokeGeminiAi(){
    const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
 const interaction = await ai.interactions.create({
   model: "gemini-3.1-flash-lite",
  input: "what is an interview, answer in 5 words?",
});
console.log(interaction.output_text);
    
}
export default invokeGeminiAi;