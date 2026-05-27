import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, progress } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert, supportive AI mentor for a student. 
          The user's current progress is ${progress}%. 
          
          If progress is under 70%, provide encouraging but firm guidance on how to improve.
          If progress is 100%, celebrate their achievement.
          
          When the user asks about a task (like Java or DSA), provide:
          1. A concise explanation.
          2. Specific, actionable steps to master the topic.
          3. Recommendations for high-quality YouTube channels or search terms for learning.
          
          If the user provides notes or work, analyze it for errors, suggest corrections, and explain why. 
          Be professional, helpful, and motivating. Keep responses structured and clear.`
        },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return NextResponse.json({ reply: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json({ reply: "I am ready to help. Please tell me what you are working on." }, { status: 500 });
  }
}