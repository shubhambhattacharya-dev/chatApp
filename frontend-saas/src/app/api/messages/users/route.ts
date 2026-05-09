import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const users = await User.find({ _id: { $ne: payload.userId } })
      .select("_id username fullName email profilePic isOnline lastSeen")
      .sort({ fullName: 1 });

    return NextResponse.json(
      { success: true, users },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}