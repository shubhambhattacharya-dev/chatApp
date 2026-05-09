import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Workspace from "@/models/workspace.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function POST(request: Request) {
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

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Workspace name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    
    // Check if slug exists
    let finalSlug = slug;
    let counter = 1;
    while (await Workspace.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const workspace = await Workspace.create({
      name,
      slug: finalSlug,
      ownerId: payload.userId,
      members: [payload.userId],
    });

    return NextResponse.json(
      { success: true, workspace },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create workspace error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const workspaces = await Workspace.find({
      members: payload.userId,
    }).populate("ownerId", "username fullName");

    return NextResponse.json(
      { success: true, workspaces },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get workspaces error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}