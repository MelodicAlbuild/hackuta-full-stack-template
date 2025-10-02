import express from "express";
import { PrismaClient } from "@repo/db";

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(express.json());

// This will be filled in during the live coding session

app.listen(PORT, () => {
    console.log(`Express API server listening on http://localhost:${PORT}`);
});
