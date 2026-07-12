import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/services/auth.service";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CreateUserSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const roleToAssign = (validatedData.role || "DRIVER") as RoleType;

    const newUser = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash: hashedPassword,
        role: roleToAssign,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    );

    response.cookies.set("session", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during registration" },
      { status: 500 },
    );
  }
}
