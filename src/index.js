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
        await CronManager.execute();
        await db;
       console.info(`Server running on port ${config.port}`);
    } catch (error) {
        console.error(error);
    }
});
