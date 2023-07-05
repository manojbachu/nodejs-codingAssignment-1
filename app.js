const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const isMatch = require("date-fns/isMatch");
const format = require("date-fns/format");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let dataBase = null;
const initializeServerAndDb = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is starting at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Server Error: ${error.message}`);
  }
};

initializeServerAndDb();

//API 1
app.get("/todos/", async (request, response) => {
  const { category, status, priority, search_q } = request.query;

  switch (true) {
    case status !== undefined && priority !== undefined:
      const getTodoSPQuery = `SELECT * FROM todo
          WHERE status = '${status}' AND priority = '${priority}'; `;
      const todoSPArray = await dataBase.all(getTodoSPQuery);
      if (todoSPArray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(
          todoSPArray.map((each) => {
            return {
              id: each.id,
              todo: each.todo,
              priority: each.priority,
              status: each.status,
              category: each.category,
              dueDate: each.due_date,
            };
          })
        );
      }
      break;

    case category !== undefined && status !== undefined:
      const getTodoCSQuery = `
        SELECT * FROM todo
        WHERE category = '${category}' AND status = '${status}';`;
      const todoCSArray = await dataBase.all(getTodoCSQuery);
      response.send(
        todoCSArray.map((each) => {
          return {
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          };
        })
      );
      break;

    case category !== undefined && priority !== undefined:
      const getTodoCPQuery = `
        SELECT * FROM todo
        WHERE category = '${category}' AND priority = '${priority}';`;
      const todoCPArray = await dataBase.all(getTodoCPQuery);
      response.send(
        todoCPArray.map((each) => {
          return {
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          };
        })
      );
      break;

    case status !== undefined:
      const getTodoStatusQuery = `SELECT * FROM todo
          WHERE status = '${status}';`;
      const todoStatusArray = await dataBase.all(getTodoStatusQuery);
      if (todoStatusArray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(
          todoStatusArray.map((each) => {
            return {
              id: each.id,
              todo: each.todo,
              priority: each.priority,
              status: each.status,
              category: each.category,
              dueDate: each.due_date,
            };
          })
        );
      }
      break;
    case priority !== undefined:
      const getTodoPriorityQuery = `SELECT * FROM todo
          WHERE priority = '${priority}'; `;
      const todoPriorityArray = await dataBase.all(getTodoPriorityQuery);
      if (todoPriorityArray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(
          todoPriorityArray.map((each) => {
            return {
              id: each.id,
              todo: each.todo,
              priority: each.priority,
              status: each.status,
              category: each.category,
              dueDate: each.due_date,
            };
          })
        );
      }
      break;
    case search_q !== undefined:
      getTodoSearchQuery = `SELECT * FROM todo
          WHERE todo LIKE '%${search_q}%'; `;
      const searchArray = await dataBase.all(getTodoSearchQuery);
      response.send(
        searchArray.map((each) => {
          return {
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          };
        })
      );
      break;

    case category !== undefined:
      const getTodoCategoryQuery = `SELECT * FROM todo
          WHERE category = '${category}'; `;
      const todoCategoryArray = await dataBase.all(getTodoCategoryQuery);
      if (todoCategoryArray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.send(
          todoCategoryArray.map((each) => {
            return {
              id: each.id,
              todo: each.todo,
              priority: each.priority,
              status: each.status,
              category: each.category,
              dueDate: each.due_date,
            };
          })
        );
      }
      break;
  }
});

// API 2

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    where id = ${todoId};`;
  const todo = await dataBase.get(getTodoQuery);
  response.send({
    id: todo.id,
    todo: todo.todo,
    priority: todo.priority,
    status: todo.status,
    category: todo.category,
    dueDate: todo.due_date,
  });
});

// API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getTodoDateQuery = `
    SELECT * FROM todo
    WHERE due_date = '${date}'`;
  const dueArray = await dataBase.get(getTodoDateQuery);
  if (dueArray === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    response.send(
      dueArray.map((each) => {
        return {
          id: each.id,
          todo: each.todo,
          priority: each.priority,
          status: each.status,
          category: each.category,
          dueDate: each.due_date,
        };
      })
    );
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const date = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `
    INSERT INTO todo
    (id,todo,priority,status,category, due_date)
    VALUES(
        ${id},'${todo}','${priority}','${status}',
        '${category}', ${date}
    );`;
          await dataBase.run(addTodoQuery);

          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;

  switch (true) {
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        let StatusUpdateQuery = `
            UPDATE todo
            SET 
            status = '${status}'
            WHERE id = ${todoId};`;
        await dataBase.run(StatusUpdateQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        let PriorityUpdateQuery = `
            UPDATE todo
            SET 
            priority = '${priority}'
            WHERE id = ${todoId};`;
        await dataBase.run(PriorityUpdateQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case todo !== undefined:
      let todoUpdateQuery = `
            UPDATE todo
            SET 
            todo = '${todo}'
            WHERE id = ${todoId};`;
      await dataBase.run(todoUpdateQuery);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        let categoryUpdateQuery = `
            UPDATE todo
            SET 
            category = '${category}'
            WHERE id = ${todoId};`;
        await dataBase.run(categoryUpdateQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const date = format(new Date(dueDate), "yyyy-MM-dd");
        let dueDateUpdateQuery = `
            UPDATE todo
            SET 
            due_date = '${date}'
            WHERE id = ${todoId};`;
        await dataBase.run(dueDateUpdateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }

      break;
  }
});

//API 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await dataBase.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
