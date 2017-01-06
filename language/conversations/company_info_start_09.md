---
title: company_info_start_09
timestamp: 2016-07-12T20:47:02.809454397-04:00
---

tell me about [dow](company_name)
* request_information/company

< What company would you like information about?
* ask_info/company_name

[dow chemical](company_name)
* provide_info/company_name

< You are referring to [Dow Chemical Company](company_name), listed as [DOW](ticker_symbol)?
* ask_confirm/company

i am
* accept/confirm

< The [Dow Chemical Company](company_name) manufactures and supplies products that are used primarily as raw materials in the manufacture of customer products and services worldwide.
* provide_company_info/description

what is it trading at?
* request_price/current

< As of last trade [yesterday](time/price_time), [DOW](ticker_symbol) was at [$34.64](currency/price) per share
* provide_price/most_recent

what is its [market cap](datapoint)?
* ask_company_data

< The [market capitization](datapoint) of [Dow Chemical Company](company_name) is about [$34 billion](approximate_amount)
* provide_data

