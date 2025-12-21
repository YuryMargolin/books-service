import {Author, Book} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const findBookAuthors = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn);
    if (!book) {
        return res.status(404).send({error: `Book with isbn ${req.params.isbn} not found`});
    }
    const authors = await book.getAuthors();
    return res.json(authors.map(a => ({name: a.name, birthDate: a.birth_date})));
}

export const removeAuthor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const author = await Author.findByPk(req.params.name, {
            transaction: t,
            attributes: {
                include: [[sequelize.col('birth_date'), 'birthDate']],
                exclude: ['birth_date']
            },
            joinTableAttributes: []
        });
        if (!author) {
            return res.status(404).send({error: `Author with name ${req.params.name} not found`});
        }
        const books = await author.getBooks({transaction: t});
        if (books.length > 0) {
            return res.status(409).send({error: `Author ${author.name} has books and cannot be removed`});
        }
        await author.destroy({transaction: t});
        await t.commit();
        return res.json(author);
    } catch (e){
        t.rollback();
        console.log('Error removing author:', e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to remove author'
        });
    }
}