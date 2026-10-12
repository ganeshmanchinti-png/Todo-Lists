const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todo.db"),
      driver: sqlite3.Database,
    });

    await db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_done INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

///POST API

app.post("/todos/", async (request, response) => {
  const { name } = request.body;
  const addTodoQuery = `
    INSERT INTO todos (name)
    VALUES ('${name}');`;

  const dbResponse = await db.run(addTodoQuery);
  const todo = await db.get("SELECT * FROM todos WHERE id = ?", [
    dbResponse.lastID,
  ]);
  response.status(200).send(todo);
});

///GET API
app.get("/todos/", async (request, response) => {
  const getTodosQuery = `
    SELECT * FROM todos;`;

  const todosArray = await db.all(getTodosQuery);
  response.status(200);
  response.send(todosArray);
});

///PUT API
app.put("/todos/:id/", async (request, response) => {
  const { id } = request.params;
  const { is_done } = request.body;

  const updateTodoQuery = `
    UPDATE todos
    SET is_done = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;`;

  await db.run(updateTodoQuery, [is_done, id]);
  const todo = await db.get("SELECT * FROM todos WHERE id = ?", [id]);
  response.status(200).send(todo);
});

///DELETE API

app.delete("/todos/:id/", async (request, response) => {
  const { id } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todos
    WHERE id = ${id};`;

  const dbResponse = await db.run(deleteTodoQuery);
  response.send("Todo Deleted Successfully");
});
