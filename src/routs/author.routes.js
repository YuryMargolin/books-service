import express from 'express';
import {findBookAuthors, removeAuthor} from "../controller/author.controller.js";

const router = express.Router();

router.get('/authors/book/:isbn', findBookAuthors)
router.delete('/author/:name',  removeAuthor)

export default router;