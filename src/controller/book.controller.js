import {Author, Book, Publisher} from "../model/index.js";
import {sequelize} from "../config/database.js";
import AuthorModel from "../model/author.model.js";

export const addBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {isbn, title, publisher, authors} = req.body;
        const existingBook = await Book.findByPk(isbn);
        if (existingBook) {
            await t.rollback();
            return res.status(409).send({
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
        const book = await Book.create(
            {isbn, title, publisher: publisher},
            {transaction: t});
        await book.setAuthors(authorRecords, {transaction: t});
        await t.commit();
        return res.status(201).send(book);
    } catch (e) {
        await t.rollback();
        console.log('Error adding book:', e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to add book'
        });
    }
};

export const findBookByIsbn = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn, {
        include: [
            {
                model: Author, as: 'authors',
                attributes: {
                    include: [[sequelize.col('birth_date'), 'birthDate']],
                    exclude: ['publisher_name']
                }, through: {attributes: []}
            }
        ]
    });
    if (book) {
        return res.json(book);
    } else {
        return res.status(404).send({error: `Book with isbn ${req.params.isbn} not found`});
    }
};

export const removeBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const book = await Book.findByPk(req.params.isbn, {
            include: [
                {
                    model: Author, as: 'authors',
                    attributes: {
                        include: [[sequelize.col('birth_date'), 'birthDate']],
                        exclude: ['publisher_name']
                    }, through: {attributes: []}
                }
            ],
            transaction: t
        });
        if (book) {
            await book.destroy({transaction: t});
            await t.commit();
            return res.json(book);
        } else {
            await t.rollback();
            return res.status(404).send({error: `Book with isbn ${req.params.isbn} not found`});
        }
    } catch (e) {
        await t.rollback();
        console.log('Error removing book:', e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to remove book'
        });
    }
}

export const updateBookTitle = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const book = await Book.findByPk(req.params.isbn, {
            include: [
                {
                    model: Author, as: 'authors',
                    attributes: {
                        include: [[sequelize.col('birth_date'), 'birthDate']],
                        exclude: ['birthdate']
                    }, through: {attributes: []}
                }
            ],
            transaction: t
        });
        if (book) {
            //other option
            // book.title = req.params.title;
            // await book.save({transaction: t});
            await book.update({title: req.params.title}, {transaction: t});
            await t.commit();
            return res.json(book);
        } else {
            await t.rollback();
            return res.status(404).send({error: `Book with isbn ${req.params.isbn} not found`});
        }
    } catch (e) {
        await t.rollback();
        console.log('Error updating book:', e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to update book'
        });
    }
}