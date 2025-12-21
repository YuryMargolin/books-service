import express from 'express';
import {findBookAuthors} from "../controller/author.controller.js";

const router = express.Router();

router.get('/authors/book/:isbn', findBookAuthors)

export default router;