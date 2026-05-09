import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { getTokenFromCookies } from "@/lib/auth";
import { verifyToken } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { success: true, message: "Logged out" },
        { status: 200 }
      );
    }

    const payload = verifyToken(token);
    
    if (payload) {
      await connectDB();
      const user = await User.findById(payload.userId);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
      }
    }

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}