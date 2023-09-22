const services = require('../services');
const { CronJob } = require('cron');
const logger = require('./logger.util');

class CronManager {

    static async execute() {
        services.forEach(service => {
            const task = new service();
            const job = new CronJob(task.cronExpression, () => {
                logger.info(`[${task.name}] - [executing]`);
                task.execute();
            },null, false, 'America/Bogota');
            job.start();
        });
    }

}

module.exports = {
    CronManager
}