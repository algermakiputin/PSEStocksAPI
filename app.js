const mysql = require('./DBConnect');
const express = require('express');
const axios = require('axios'); 
const app = express(); 
const jsdom = require('jsdom');
require('dotenv').config();

const url = process.env.liveURL; 

async function getCompanies() {

    var test = [];
    await axios.post(url, {
        companyId:'',
        keyword: '',
        sector: 'ALL',
        subsector: 'ALL',
        json:true
    }).then(res => { 
        const dom = new jsdom.JSDOM(res.data);
        const table = dom.window.document.querySelector(".list")
        const tbody = table.querySelector("tbody");
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((element) => {
            const name = element.querySelectorAll("td")[0].textContent;
            const symbol = element.querySelectorAll("td")[1].textContent;
            const sector = element.querySelectorAll("td")[2].textContent;
            const subsector = element.querySelectorAll("td")[3].textContent;
            const listingDate = element.querySelectorAll("td")[4].textContent; 
        
        })

    }).catch(err => {
        console.log(err)
    })
}

app.get('/', async (req, res) => {
    
    getCompanies();
    res.send();
})


app.listen(3000);