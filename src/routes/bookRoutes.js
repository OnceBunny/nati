import express from "express";
import cloudinary from "../lib/cloudinary.js";
import { Book } from "../models/Book.js";
import { protectAuth } from "../middleware/auth.middleware.js";
const router = express.Router();

// Create Book
router.post("/", protectAuth, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    //save to database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all books
//Implement pagination
//const response = await fetch("http://localhost:3000/api/books?page=1&limit=5"); Refrence, the page and limit helps to implement pagination according to user scroll
router.get("/", protectAuth, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit; //calculate skip
    const books = await Book.find()
      .sort({ createdAt: -1 }) //sort by createdAt in descending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");
    const totalBooks = await Book.countDocuments();
    res.status(200).json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error getting books", error);
    res.status(500).json({ message: error.message });
  }
});

//get recommended books by the logged in user
router.get("/user", protectAuth, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(books);
  } catch (error) {
    console.log("Error getting books", error);
    res.status(500).json({ message: error.message });
  }
});
router.delete("/", protectAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
    }
    //check if user is creator of book
    if (book.user.toString() !== req.user._id.toString()) {
      res
        .status(401)
        .json({ message: "You are not authorized to delete this book" });
    }

    //delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: error.message });
  }
});
export default router;
