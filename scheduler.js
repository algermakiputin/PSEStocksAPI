const { updatePrices } = require('./functions');
const { CronJob } = require('cron');
//00 00 16 * * 1-5
const priceUpdates = new CronJob(
    '*/3 * * * * 1-6',
    function() {
        console.log('cron is running')
    },
    null,
    false,
    'Asia/Manila'
);

priceUpdates.start();