import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import todomodel from './Models/Todo.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [""], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json()); // Parse JSON request bodies

// Routes
app.get("/", async (req, res) => {
    try {
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        res.json({ message: "Deployed Successfully.", databases: dbs.databases });
    } catch (err) {
        console.error("Error fetching database list:", err);
        res.status(500).json({ error: "Failed to fetch database list" });
    }
});

// Fetch all todos
app.get('/get', async (req, res) => {
    try {
        const todos = await todomodel.find();
        todos.forEach(todo => {
            if (todo.task.length > 30) {
                todo.task = `${todo.task.substring(0, 30)}...`;
            }
        });
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add a new todo
app.post('/add', async (req, res) => {
    try {
        const { task } = req.body;
        if (!task) return res.status(400).json({ error: "Task cannot be empty" });

        const newTodo = await todomodel.create({ task });
        res.status(201).json(newTodo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// Update a todo
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { task, done } = req.body;

        const updatedTodo = await todomodel.findByIdAndUpdate(id, { task, done }, { new: true });
        if (!updatedTodo) return res.status(404).json({ error: "Todo not found" });

        res.json(updatedTodo);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Delete a todo
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await todomodel.findByIdAndDelete(id);
        if (!deletedTodo) return res.status(404).json({ error: "Todo not found" });

        res.json(deletedTodo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// Start server and connect to MongoDB
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI,)
    .then(() => {
        console.log("Connection successful to MongoDB");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));
