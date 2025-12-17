import express from "express";
import {addBook, findBookByIsbn} from "../controller/book.controller.js";

const router = express.Router();

router.post("/book", addBook);
router.get("/book/:isbn", findBookByIsbn);

export default router;