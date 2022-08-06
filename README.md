# PSE Stocks API
Get Philippines stock exchange publicly traded companies and market historical price. 
## Request
`GET /stocks/{$page}`  Get publicly traded companies of PSE
```URL
https://psestocksapi.herokuapp.com/stocks/1
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
## Request
`GET /stock/{symbol}` Get company details by symbol
```URL
https://psestocksapi.herokuapp.com/stock/DITO
```
## Response
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
<br>
<p align="center">
	<a href="https://www.paypal.com/paypalme/imacky"><img width="185" src="https://raw.githubusercontent.com/k4m4/donations/master/images/badge.svg" alt="Badge"></a>
	<br><br>
	<b>🙌 Send <a href="https://www.paypal.com/paypalme/imacky">donations</a> to help support this <b>project!</b> 🙌</b>
</p>
<br>
