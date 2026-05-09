import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { generateToken, cookieOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { fullName, email, password } = await request.json();

    // Validate
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Generate username from email
    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully",
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
      { status: 201 }
    );

    response.cookies.set("jwt", token, cookieOptions());

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}