import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { generateToken, cookieOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    response.cookies.set("jwt", token, cookieOptions());

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}