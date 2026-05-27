import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserData from "@/models/UserData";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { messages, mode, behavior, chatMode } = await req.json();
    await connectToDatabase();
    
    // Ensure Groq Key exists if online
    if (mode === "online" && !process.env.GROQ_API_KEY) {
        return NextResponse.json({ reply: "SYSTEM ERROR: GROQ_API_KEY is missing from .env.local file." }, { status: 500 });
    }

    const apiEndpoint = mode === "offline" 
      ? "http://127.0.0.1:11434/v1/chat/completions" 
      : "https://api.groq.com/openai/v1/chat/completions";
    
    const apiKey = mode === "offline" ? "ollama" : process.env.GROQ_API_KEY;
    const temperature = chatMode === "deep" ? 0.8 : 0.2;

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        model: mode === "offline" ? "dolphin-mistral" : "llama3-8b-8192", 
        messages: [{ role: "system", content: behavior || "Be highly technical." }, ...messages],
        temperature: temperature
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API Error:", errorText);
        return NextResponse.json({ reply: `API ERROR: ${errorText}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Terminal API Exception:", error);
    return NextResponse.json({ reply: "CRITICAL ERROR: Backend failed to execute fetch request. Check server console." }, { status: 500 });
  }
}