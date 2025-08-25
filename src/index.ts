import { Hono } from "hono";
import prisma from "../db";

const app = new Hono();

// get semua todo
app.get("/todos", async (c) => {
  const todos = await prisma.todo.findMany({
    orderBy: { id: "desc" },
  });
  return c.json(todos);
});

// GET todo by id
app.get("/todo/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const todo = await prisma.todo.findUnique({
    where: { id },
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

  const todo = await prisma.todo.create({
    data: { title },
  });

  return c.json(todo, 201);
});

// update todo
app.put("/todo/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const body = await c.req.json();
  const { title, completed } = body;

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id },
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
if (typeof Bun !== "undefined" && typeof process !== "undefined" && (process.env.BUN_WORKER_ID !== undefined || process.env.BUN_REPL !== undefined)) {
  const port = Number(process.env.PORT || 3000);
  console.log(`Listening on http://localhost:${port}`);
  Bun.serve({ fetch: app.fetch, port });
}
