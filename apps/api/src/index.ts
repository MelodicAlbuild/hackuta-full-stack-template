import express from "express";
import { PrismaClient } from "@repo/db";

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// ===== TASK ROUTES =====

// Get all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                category: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
    try {
        const { title, description, categoryId, tagIds } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                categoryId: categoryId || null,
                tags: tagIds
                    ? {
                        create: tagIds.map((tagId: number) => ({
                            tag: { connect: { id: tagId } },
                        })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed, categoryId, tagIds } = req.body;

        // If tagIds are provided, we need to update the relations
        const updateData: any = {
            title,
            description,
            completed,
            categoryId: categoryId || null,
        };

        if (tagIds !== undefined) {
            // Delete existing tag relations and create new ones
            await prisma.taskTag.deleteMany({
                where: { taskId: parseInt(id) },
            });

            updateData.tags = {
                create: tagIds.map((tagId: number) => ({
                    tag: { connect: { id: tagId } },
                })),
            };
        }

        const task = await prisma.task.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                category: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// Toggle task completion
app.patch("/api/tasks/:id/toggle", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        const updated = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { completed: !task.completed },
            include: {
                category: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle task" });
    }
});

// ===== CATEGORY ROUTES =====

// Get all categories
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// Create a category
app.post("/api/categories", async (req, res) => {
    try {
        const { name, color } = req.body;
        const category = await prisma.category.create({
            data: { name, color: color || "#3b82f6" },
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to create category" });
    }
});

// Delete a category
app.delete("/api/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

// ===== TAG ROUTES =====

// Get all tags
app.get("/api/tags", async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tags" });
    }
});

// Create a tag
app.post("/api/tags", async (req, res) => {
    try {
        const { name, color } = req.body;
        const tag = await prisma.tag.create({
            data: { name, color: color || "#10b981" },
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: "Failed to create tag" });
    }
});

// Delete a tag
app.delete("/api/tags/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.tag.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete tag" });
    }
});

// ===== STATS ROUTE =====

// Get dashboard statistics
app.get("/api/stats", async (req, res) => {
    try {
        const totalTasks = await prisma.task.count();
        const completedTasks = await prisma.task.count({
            where: { completed: true },
        });
        const totalCategories = await prisma.category.count();
        const totalTags = await prisma.tag.count();

        res.json({
            totalTasks,
            completedTasks,
            activeTasks: totalTasks - completedTasks,
            totalCategories,
            totalTags,
            completionRate:
                totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

app.listen(PORT, () => {
    console.log(`Express API server listening on http://localhost:${PORT}`);
});
