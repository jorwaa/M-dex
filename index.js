require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./src/config/config');
const apiRouter = require('./src/routes/api');
const mainRouter = require('./src/routes/main');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRouter);
app.use('/', mainRouter);


const port = config.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}!`));