import { Hono } from "hono";
import prisma from "../db";
import {
  generateToken,
  hashPassword,
  comparePassword,
  getUserIdFromToken,
} from "../utils/auth";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// get all user with admin previlieage
app.post("/allUsers", async (c) => {
  const body = await c.req.json();

  if (!body.adminPass) {
    return c.json({ message: "Missing Admin Code" }, 400);
  }

  const adminPass = body.adminPass;

  // validate pass
  if (adminPass == "admin") {
    const users = await prisma.user.findMany();
    return c.json(users);
  } else {
    return c.json({ message: "Invalid Admin Code" }, 403);
  }
});

// register for new user;
app.post("/register", async (c) => {
  const body = await c.req.json();

  // validate body
  if (!body.email || !body.password) {
    return c.json({ message: "Missing email or password" }, 400);
  }

  const { email, password } = body;

  // extra validation to avoid passing undefined to bcrypt
  if (typeof password !== "string" || password.length === 0) {
    return c.json({ message: "Password must be a non-empty string" }, 400);
  }

  let hashed: string;
  try {
    hashed = await hashPassword(password);
  } catch (err) {
    return c.json(
      { message: (err as Error).message || "Failed to hash password" },
      500
    );
  }

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    return c.json(
      {
        id: user.id,
        email: user.email,
        message: "User registered successfully",
      },
      201
    );
  } catch (err) {
    return c.json({ message: "Email already registered" }, 400);
  }
});

// login
app.post("/login", async (c) => {
  const body = await c.req.json();
  // basic sanity checks to avoid passing undefined to Prisma
  if (!body || typeof body !== "object") {
    return c.json({ message: "Invalid request body" }, 400);
  }

  const { email, password } = body as { email?: unknown; password?: unknown };

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return c.json({ message: "Missing or invalid email or password" }, 400);
  }

  const emailStr = email.trim();

  // find user safely
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: emailStr } });
  } catch (err) {
    // defensive: if Prisma complains, return a 400 with a safe message
    return c.json({ message: "Invalid query or parameters" }, 400);
  }

  if (!user) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const token = await generateToken({ id: user.id, email: user.email });
  return c.json({ token });
});

// protected routes
app.use("/todos/*", authMiddleware);

// get semua todo
app.get("/todos", async (c) => {
  const tokenRaw = c.req.header("authorization");
  const token = tokenRaw?.replace("Bearer ", "").trim();
  const uid = await getUserIdFromToken(token as string);

  const todos = await prisma.todo.findMany({
    orderBy: { id: "desc" },
    where: { userId: uid as number },
  });
  return c.json(todos);
});

// GET todo by id
app.get("/todo/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);

  const tokenRaw = c.req.header("authorization");
  const token = tokenRaw?.replace("Bearer ", "").trim();
  const uid = await getUserIdFromToken(token as string);

  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const todo = await prisma.todo.findUnique({
    where: { id, userId: uid as number },
  });

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }
  return c.json(todo);
});

// post tambah todo
app.post("/todo", async (c) => {
  const body = await c.req.json();
  const { title } = body;

  // validate title and userId
  // get uid from token
  const tokenRaw = c.req.header("authorization");
  // get only token without bearer
  const token = tokenRaw?.replace("Bearer ", "").trim();
  const uid = await getUserIdFromToken(token as string);

  if (!title || Number.isNaN(uid)) {
    return c.json({ message: "Missing or invalid title/userId" }, 400);
  }

  const todo = await prisma.todo.create({
    data: {
      title,
      user: { connect: { id: uid as number } },
    },
  });

  return c.json(todo, 201);
});

// update todo
app.put("/todo/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);

  const tokenRaw = c.req.header("authorization");
  const token = tokenRaw?.replace("Bearer ", "").trim();
  const uid = await getUserIdFromToken(token as string);

  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const body = await c.req.json();
  const { title, completed } = body;

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id, userId: uid as number },
      data: { title, completed },
    });
    return c.json(updatedTodo);
  } catch (err) {
    return c.json({ message: "Todo not found" }, 404);
  }
});

app.delete("/todo/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  try {
    const deletedTodo = await prisma.todo.delete({
      where: { id },
    });
    return c.json(deletedTodo);
  } catch (err) {
    return c.json({ message: "Todo not found" }, 404);
  }
});

export default app;

// Jika dijalankan langsung dengan `bun src/index.ts`, jalankan server Bun
if (
  typeof Bun !== "undefined" &&
  typeof process !== "undefined" &&
  (process.env.BUN_WORKER_ID !== undefined ||
    process.env.BUN_REPL !== undefined)
) {
  const port = Number(process.env.PORT || 3000);
  console.log(`Listening on http://localhost:${port}`);
  Bun.serve({ fetch: app.fetch, port });
}
