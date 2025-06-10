import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { nanoid } from "nanoid";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import aragon from "argon2";

const app = new Hono().basePath("/api/v1/");

const userSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email" }),
  type: z.string().min(2, { message: "Type is required" }),
  image: z.string(),
});

const createUser = app.post(
  "/register",
  zValidator("json", userSchema, (result, c) => {
    console.log("zValidator result", result);
    if (!result.success) {
      return c.json({ message: result.error.errors[0].message }, 400);
    }
  }),
  async (c) => {
    try {
      console.log("createUser");
      const { name, email, type, image } = c.req.valid("json");
      const id = nanoid();
      const password = nanoid();
      const hash = await aragon.hash(password);
      console.log("hash", hash);
      await db
        .insert(user)
        .values({
          id,
          name,
          email,
          password: hash,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      return c.json({ status: true });
    } catch (error) {
      return c.json({ status: false });
    }
  }
);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export type ICreateUser = typeof createUser;
