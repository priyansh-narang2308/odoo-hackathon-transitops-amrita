import { db } from "../lib/db";
import { z } from "zod";
import { RoleType } from "@prisma/client";

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"])
    .optional()
    .default("DRIVER"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export class AuthService {
  static async getUserByEmail(email: string) {
    return await db.user.findUnique({
      where: { email },
    });
  }

  static async createUser(data: CreateUserInput) {
    const validatedData = CreateUserSchema.parse(data);

    const fakePasswordHash = validatedData.password + "_hashed";

    const newUser = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash: fakePasswordHash,
        role: validatedData.role as RoleType,
      },
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  }
}
