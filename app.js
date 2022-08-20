
require('dotenv').config();
const express = require('express');
const app = express();   
const { fetchAPI, wait, validateDate, updatePrices } = require('./functions');
const serverURL = process.env.serverURL;

app.get('/stocks/:page?', async (req, res) => {  
    const url = `${serverURL}/stocks/${req.params.page || 1}`; 
    await wait(250).then(async() => {
        const response = await fetchAPI(url);
        res.send(response);
    });  
});

app.get('/stock/quote', async(req, res) => {
    const { symbol, startDate, endDate } = req.query;  
    let response = {};
    if (symbol && validateDate(startDate) && validateDate(endDate)) {
        const url = `${serverURL}/stock/quote?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`;  
        await wait(250).then(async() => {
            response = await fetchAPI(url);
        });
    }else {
        response = { error: 'Invalid query string parameter' }
    } 
    res.json(response);
});

app.get('/stock/:symbol', async(req, res) => {
    const url = `${serverURL}/stock/${req.params.symbol}`; 
    await wait(250).then(async() => {
        const response = await fetchAPI(url);
        res.send(response);
    });
}); 

app.get('/', async(req, res) => {  
    await updatePrices();
    res.send({success: true});
    //return res.redirect('https://github.com/algermakiputin/PSEStocksAPI');
})

app.listen(process.env.PORT); 