import {Author, Book} from "../model/index.js";
import {sequelize} from "../config/database.js";
import {QueryTypes} from "sequelize";

export const findPublishersByAuthor = async (req, res) => {
    const author = await Author.findByPk(req.params.name);
    if (!author) {
        return res.status(404).send({error: `Author with name ${req.params.name} not found`});
    }
    const publishers = await sequelize.query(`
                SELECT DISTINCT b.publisher
                FROM books b
                         JOIN books_authors ba ON b.isbn = ba.isbn
                         JOIN authors a ON ba.author_name = a.name
                WHERE a.name = :name
                `, {
        replacements: {name: req.params.name},
            type: QueryTypes.SELECT
        });
    return res.json(publishers.map(p => p.publisher));
}