import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = LoginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. User not found." },
        { status: 401 },
      );
    }

    const expectedHash = password + "_hashed";
    const isMatch =
      user.passwordHash === password || user.passwordHash === expectedHash;

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Password mismatch." },
        { status: 401 },
      );
    }

    if (role && user.role !== role) {
      await db.user.update({
        where: { id: user.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { role: role as any },
      });
      user.role = role as never;
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("session", user.id, {
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
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during login" },
      { status: 500 },
    );
  }
}
