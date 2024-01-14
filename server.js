import express from 'express';
import bodyParser from 'body-parser';
import controller from './controller.js';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', controller.Home);

app.post('/login', controller.login);

app.get('/download_data', controller.download_data);

app.post('/download', controller.download);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
