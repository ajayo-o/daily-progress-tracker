import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserData from "@/models/UserData";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { title, rawSyllabus, days } = await req.json();
    
    const prompt = `Break this syllabus: "${rawSyllabus}" into ${days} daily tasks. 
    Return as a JSON array: [{"id": "1", "text": "...", "completed": false}]. No conversational filler.`;

    // Same API logic as terminal (could be abstracted to a helper file)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const match = typeof content === "string" ? content.match(/\[([\s\S]*)\]/) : null;
    const tasks = match ? JSON.parse(match[0]) : [];

    await connectToDatabase();
    await UserData.updateOne(
      { clerkUserId: session.user.email },
      { $push: { tasks: { $each: tasks } } }
    );

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return new NextResponse("Syllabus Generation Failed", { status: 500 });
  }
}