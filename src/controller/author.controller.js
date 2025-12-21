import {Book} from "../model/index.js";

export const findBookAuthors = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn);
    if (!book) {
        return res.status(404).send({error: `Book with isbn ${req.params.isbn} not found`});
    }
    const authors = await book.getAuthors();
    return res.json(authors.map(a => ({name: a.name, birthDate: a.birth_date})));
}