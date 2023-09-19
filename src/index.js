const express = require('express');
const config = require('./config/config');
const db = require('./db/db');
const cors = require('cors');
const { CronManager } = require('./utils/managerCron.util');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(config.port, async () => {
    try {
        const dbConnection = await db;
        if (dbConnection) {
            console.log('Database connected');
            await CronManager.execute();
        }
        console.log(`CronServices running on port ${config.port}`);
    } catch (error) {
        console.error(error);
    }
});
