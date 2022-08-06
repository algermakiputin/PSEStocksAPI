
const express = require('express');
const app = express(); 
const job = require('./scheduler'); 
const axios = require('axios');
const { updatePrices, updatePriceVolume } = require('./functions');

app.get('/', async (req, res) => {  
    res.send(); 
})


app.listen(3000);