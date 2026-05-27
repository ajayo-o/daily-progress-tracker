import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserData from "@/models/UserData";

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const userData = await UserData.findOne({ clerkUserId: session.user.email });
    return NextResponse.json(userData || {});
  } catch (error) {
    console.error("GET Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const updatedData = await UserData.findOneAndUpdate(
      { clerkUserId: session.user.email }, 
      { $set: { ...body, clerkUserId: session.user.email } }, 
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}