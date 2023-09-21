const mongoose = require('mongoose');
const config = require('../config/config');
require('../models/affiliates.model');
require('../models/affiliatesSuscription.model');
require('../models/assistance.model');
require('../models/payments.model');

mongoose.Promise = global.Promise;

const db = mongoose.connect(config.mongoUrl, {
    dbName: config.dbName,
});

module.exports = db;