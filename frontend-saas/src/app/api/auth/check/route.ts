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
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authenticated",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check auth error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}