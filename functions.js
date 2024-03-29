require('dotenv').config();
const jsdom = require('jsdom');
const axios = require('axios');
const mysql = require('./DBConnect');

const url = process.env.liveURL; 
const pricesURL = process.env.pricesURL; 
const profileURL = process.env.profileURL;
const apiURL = process.env.apiURL;
const quoteURL = process.env.quoteURL;

async function fetchAPI(url) {
    return await axios.get(url).then(result => {
        return result.data;
    }).catch(error => {
        console.log(error);
        return {error: 'Internal server error'};
    })
}

const getCompanyProfile = async(companyId, securityId) => {
    const url = `${profileURL}?cmpy_id=${companyId}&security_id=${securityId}`;
    return await axios.get(url).then(result => {
        const dom = new jsdom.JSDOM(result.data);
        const table = dom.window.document.querySelectorAll(".view")[1]?.querySelector("tbody");
        if (table) {
            const rows = table.querySelectorAll("tr");
            const volume = cleanPrice(rows[3].querySelector("td").textContent); 
            const averagePrice = cleanPrice(rows[3].querySelectorAll("td")[1].textContent);
            return {
                volume,
                averagePrice
            }
        }
    });
}

async function getVolume(symbol, date) {
    const parsedDate = new Date(date);
    const formattedDate = dateFormat(parsedDate);
    const url = `${apiURL}/${symbol}.${formattedDate}.json`;
    return await axios.get(url).then(result => {
            return result.data.stock[0];
        }).catch(() => { 
            return {};
        })
}

function dateFormat(string, dayFirst = false, api = false) {
    const date = new Date(string);
    const year = date.getFullYear();
    const month = padStart(date.getMonth() + 1);
    const day = padStart(date.getDate());

    if (api) return `${month}-${day}-${year}`;
    return dayFirst? `${day}-${month}-${year}` : `${year}-${month}-${day}`;
} 

async function getStocksFromServer(limit, offset) {
    const url = `${process.env.serverURL}/api/stocks?limit=${limit}&offset=${offset}`; 
    return await axios.get(url).then(result => {
        return result;
    }).catch(error => {
        console.log('failed to fetch stocks');
        throw error;
    });
}

const updatePrices = async() => { 
    const totalStocks = 286;
    const divider = 5;
    const limit = Math.round(totalStocks / divider);    
    for (let start = 0; start <= totalStocks; start+= limit) {  
        const stocks = (await getStocksFromServer(limit, start))?.data;
        let values = []; 
        //MM-DD-YEAR
        const startDate = dateFormat(new Date(), false, true);   
        const endDate = dateFormat(new Date(), false, true);
        for (stock of stocks) {
            const price = await getPrice(stock.companyId, stock.securityId, startDate,endDate).then(await wait(100));
            //const profile = await getCompanyProfile(stock.companyId, stock.securityId);   
            if (price?.chartData?.length) { 
                const chartData = price?.chartData[0];
                const priceInfo = await getVolume(stock.symbol, chartData.CHART_DATE);  
                values.push({
                    symbol: stock?.symbol || '',
                    open: chartData?.OPEN || '',
                    close: chartData?.CLOSE || '', 
                    date: dateFormat(chartData.CHART_DATE) || '',
                    high: chartData?.HIGH || '',
                    low: chartData?.LOW || '',
                    volume: priceInfo?.volume || '',
                    stockId: stock?.id || ''
                });  
            }   
        }      
        if (values.length) {  
            axios.post(`${process.env.serverURL}/prices/update`, values).then(result => {
                console.log('data addedd successfully');
            }).catch(error => {
                console.log('failed to store data');
                throw error;
            });
        }    
    }    
} 

const updatePriceVolume = async() => { 
    const records = 116158;
    const divider = 320;
    const limit = Math.round(records / divider);   
    for (let start = 0; start < records; start+= limit) {
        const query = `SELECT * FROM prices WHERE volume=0 LIMIT ${start}, ${limit}`;  
        const prices = await fetch(query);
        let values = []; 
        for (price of prices) {  
            const priceInfo = await getVolume(price.symbol, price.date).then(await wait(50));
            if (Object.keys(priceInfo).length) {
                const query = `UPDATE prices SET volume='${priceInfo.volume}' WHERE id='${price.id}'`;
                mysql.conn.query(query, function(error, result, fields) {
                    if (error) throw error;

                    console.log('volume update successfully');
                })
            }
        }  
    }    
}

async function scrapeCompanies(pageNo) { 
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

async function getPrice(companyId, securityId, startDate, endDate) {  
    return await axios.post(pricesURL, {
        cmpy_id: companyId,
        security_id: securityId,
        startDate: startDate,
        endDate: endDate
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
        
                console.log('data stored successfully');
            });
        }
    }else {
        console.log('No companies found' );
    } 
}

async function fetch(query) {
    return new Promise( (resolve, reject) => {
        mysql.conn.query({
            sql: query,
            timeout:'3000',   
        }, function(error, results, fields) {
            if (error) reject(error);
           resolve(results);
        }); 
    }).then(result => { 
        return result;
    });
}

async function getPrices(symbol, startDate, endDate) {
    let values = [];
    const prices = await getPriceQuote(symbol, startDate, endDate).then(await wait(300)); 
    if (prices.length) {  
        prices.forEach((price,index) => {
            if (index === 0) return;
            const row = price.split(',');  
            values.push([
                stock.symbol,
                row[1],
                row[4], 
                dateFormat(row[0]),
                row[2],
                row[3],
                row[5], 
                stock.id
            ]);
        });  
    } 
    return values;
}

async function getPriceQuote(symbol, startDate, endDate) {
    const url =`${quoteURL}/${symbol}/historical-prices/download?MOD_VIEW=page&num_rows=940&range_days=940&startDate=${startDate}&endDate=${endDate}`;
    console.log(url);
    return await axios.get(url)
        .then(result => {
            return result.data.split(/\r?\n/);
        });
}

function cleanPrice(string) {
    return string.replace(/ |\n|,/gi, '');
}
 
function wait(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms)});
}

function padStart(value) {
    return value.toString().padStart(2,0)
}

function validateDate(str) {
    const regEx = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return regEx.test(str);
}

module.exports = { 
    getCompanyProfile,
    updatePrices,
    updatePriceVolume,
    fetchAPI,
    wait,
    validateDate,
};