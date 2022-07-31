const mysql = require('./DBConnect');
const express = require('express');
const axios = require('axios'); 
const app = express(); 
const jsdom = require('jsdom');
require('dotenv').config();

const url = process.env.liveURL; 
const pricesURL = process.env.pricesURL; 

async function getCompanies(pageNo) { 
    return await axios.post(`${url}?pageNo=${pageNo}`, {}, { 
            headers: { 'Content-Type': 'application/json', } 
        }
    ).then(res => {     
        const dom = new jsdom.JSDOM(res.data); 
        const table = dom.window.document.querySelector(".list")
        const tbody = table.querySelector("tbody");
        const rows = tbody.querySelectorAll("tr");
         
        if (rows.length) {
            const data = [];
            rows.forEach((element) => { 
                const name = element.querySelectorAll("td")[0].textContent; 
                if (name === "no data.") {
                    return;
                }
                const anchorTexts = element.querySelector("td a").getAttribute('onClick').split("'");
                const companyId = anchorTexts[1];
                const securityId = anchorTexts[3];
                const symbol = element.querySelectorAll("td")[1].textContent;
                const sector = element.querySelectorAll("td")[2].textContent;
                const subsector = element.querySelectorAll("td")[3].textContent;
                const listingDate = element.querySelectorAll("td")[4].textContent;
                data.push({
                    name,
                    symbol,
                    sector,
                    subsector,
                    listingDate,
                    companyId,
                    securityId,
                })    
            })

            return data;
        }

        return [];

    }).catch(err => {
        console.log(err)
    })
}

async function getPrice(companyId, securityId) { 
    
    return await axios.post(`${pricesURL}?`, {
        cmpy_id: companyId,
        security_id: securityId,
        startDate: "07-25-2022",
        endDate: "07-29-2022"
    }).then(result => {
        return result.data;
    }).catch(error => {
        console.log(error);
    })
} 

async function storeCompanies() {

    const companies = await getCompanies(1); 
    const query = "INSERT INTO stocks(name, symbol, sector, listingDate, companyId, securityId) VALUES ?";
    const values = []; 
 
    if (companies.length) {
        companies.forEach((company) => {
            values.push([company.name, company.symbol, company.sector, company.listingDate, company.companyId, company.securityId]);
        }); 

        if (values.length) {
            mysql.conn.query(query, [values], function(error, result) {
                if (error) throw error;
        
                console.log(result);
            });
        }
    }else {
        console.log('No companies found' );
    } 
}

app.get('/', async (req, res) => { 
    await store();
    res.send(); 
})


app.listen(3000);