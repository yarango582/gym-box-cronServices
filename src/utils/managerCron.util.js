const services = require('../services');
const { CronJob } = require('cron');

class CronManager {

    static async execute() {
        services.forEach(service => {
            const task = new service();
            const job = new CronJob(task.cronExpression, () => {
                console.log(`Init ${task.name} cron service`);
                service.execute();
            });
            job.start();
        });
    }

}

module.exports = {
    CronManager
}