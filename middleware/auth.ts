import { verifyToken } from "../utils/auth";
import { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader) {
    return c.json({ message: "Authorization header missing" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({message: "Invalid token"}, 401);
  }

  c.set("user", payload);
  await next();

};
