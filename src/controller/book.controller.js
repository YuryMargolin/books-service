import {Author, Book, Publisher} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const addBook = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true});
    try {
        const {isbn, title, publisher, authors} = req.body;
        const existingBook = await Book.findByPk(isbn);
        if (existingBook) {
            await t.rollback();
            res.status(409).send({
                error: `Book with isbn ${isbn} already exists`
            });
        }
        // Create or find the publisher
        if (!await Publisher.findByPk(publisher, {transaction: t})) {
            await Publisher.create(
                {publisher_name: publisher},
                {transaction: t});
        }
        // Process the authors
        const authorRecords = []
        for (const author of authors) {
            let authorRecord = await Author.findByPk(author.name, {transaction: t});
            if (!authorRecord) {
                authorRecord = await Author.create(
                    {name: author.name, birth_date: new Date(author.birthDate)},
                    {transaction: t});
            }
            if (authorRecords.findIndex(a => a.name === authorRecord.name) === -1) {
                authorRecords.push(authorRecord);
            }
        }
        // Create a new book
        const book =await Book.create(
            {isbn, title, publisher: publisher},
            {transaction: t});
        await book.setAuthors(authorRecords, {transaction: t});
        await t.commit();
        res.status(201).send(book);
    } catch (e) {
        await t.rollback();
        console.log('Error adding book:', e);
        res.status(500).send({
            error: e.message,
            message: 'Failed to add book'
        });
    }


}