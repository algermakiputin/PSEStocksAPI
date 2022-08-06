const schedule = require('node-schedule'); 
const { updatePrices } = require('./functions');

//const sched = "00 10 23 * * 1-5";
const sched = "*/3 * * * * *";
// const job = schedule.scheduleJob(sched, async function() {
    
//     await updatePrices();
// });

