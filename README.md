# PSE Stocks API
Get Philippines stock exchange publicly traded companies and market historical price. 
## Request
`GET /stocks`  Get publicly traded companies of PSE
```URL
https://psestocksapi.herokuapp.com/stocks
```
## Response
```JSON
{
  "totalRecords": 286,
  "totalPage": 15,
  "data": [
    {
      "name": "2GO Group, Inc.",
      "symbol": "2GO",
      "sector": "Services",
      "listingDate": "May 15, 1995"
    },
    {
      "name": "Asia Amalgamated Holdings Corporation",
      "symbol": "AAA",
      "sector": "Holding Firms",
      "listingDate": "Mar 22, 1973"
    },
    {
      "name": "Atok-Big Wedge Co., Inc.",
      "symbol": "AB",
      "sector": "Mining and Oil",
      "listingDate": "Jan 08, 1948"
    }
  ]
}
```
## Request - Get list of publicly traded companies of PSE
`GET /stock/{symbol}` Get company details by symbol
```URL
https://psestocksapi.herokuapp.com/stock/DITO
```
```JSON
{
  "name": "DITO CME Holdings Corp.",
  "symbol": "DITO",
  "sector": "Services",
  "listingDate": "Oct 01, 1975"
}
```
## Request 
`GET /stock/quote` Get stock price in a given period of time
#### Query Parameters
* symbol | Required
* startDate | Required
* endDate | Required
```URL
https://psestocksapi.herokuapp.com/stock/quote?symbol=CEB&startDate=2022-08-05&endDate=2022-08-05
``` 
## Response
```JSON
{
  "data": [
    {
      "symbol": "CEB",
      "open": "41.95",
      "close": "42.85",
      "date": "2022-08-05",
      "high": "43",
      "low": "41.7",
      "volume": "124600"
    }
  ]
}
```
