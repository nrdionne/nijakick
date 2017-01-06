---
title: company_info_start_06
timestamp: 2016-06-28T18:05:59.193000336-04:00
---

good afternoon
* greeting/temporal

< Good afternoon.
* greeting/temporal_afternoon

< Welcome to Finit. You can ask information about companies and stocks, and can get help by asking 'help' at any time.
* welcome/intro

i need some info about a company
* request_information/company

< What is the name of the company you would like information about?
* ask_info/company_name

[amazon](company_name)
* provide_info/company_name

< You are referring to [Amazon](company_name), with ticker symbol [AMZN](ticker_symbol)?
* ask_confirm/company

you got it
* affirmative/confirm
