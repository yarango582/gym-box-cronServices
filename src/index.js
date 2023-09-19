const express = require('express');
const config = require('./config/config');
const db = require('./db/db');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(config.port, async () => {
    const dbConnection = await db;
    if (dbConnection) {
        console.log('Database connected');
    } else {
        console.log('Database connection failed');
    }
    console.log(`CronServices running on port ${config.port}`);
});
