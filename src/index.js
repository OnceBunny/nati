import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import connectDB from "./lib/db.js";
import cors from "cors";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB();
});
