const { updatePrices } = require('./functions');
const { CronJob } = require('cron');

const priceUpdates = new CronJob(
    '00 00 16 * * 1-5',
    updatePrices,
    null,
    false,
    'Asia/Manila'
);

priceUpdates.start();