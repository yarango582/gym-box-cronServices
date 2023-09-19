
class BaseService {

    constructor(name, cronExpression) {
        this.name = name;
        this.cronExpression = cronExpression;
    }

}

module.exports = {
    BaseService
}