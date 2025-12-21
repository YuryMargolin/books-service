import dotenv from 'dotenv';
import express from 'express';
import {dbConnection} from "./config/database.js";
import {syncModels} from "./model/index.js";
import bookRouter from "./routs/book.routes.js";
import authorRouter from "./routs/author.routes.js";
import publisherRouter from "./routs/publisher.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(bookRouter);
app.use(authorRouter);
app.use(publisherRouter);


app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send({ error: 'Something went wrong!', message: err.message })
})

const startServer = async () => {
    await dbConnection();
    await syncModels();
    app.listen(port, () => console.log(`Server started on port ${port}. Press Ctrl-C to finish`));
}

startServer()