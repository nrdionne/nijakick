// INIT_VERSION: 0.0.16

'use strict'

const request = require('request')
const url = require('url')

class IntrinioClient {
  constructor(username, password) {
    this.username = username
    this.password = password
  }

  makeAuthenticatedRequest(path, query, callback) {
    const requestUrl = url.format({
      protocol: 'https',
      host: 'api.intrinio.com',
      pathname: `${path}`,
      query: query || {},
    })

    console.log('GETting', requestUrl)

    request({
      url: requestUrl,
      auth: {
        'user': this.username,
        'pass': this.password
      }
    }, (err, res, body) => {
      console.log('request succeeded to:', requestUrl)
      console.log('body:', body)

      if (err) {
        throw new Error(err)
      }

      if (res.statusCode !== 200) {
        console.log('Error from Intrinio:', body)
        throw new Error('Could not fetch financial information')
      }

      try {
        callback(JSON.parse(body))
      } catch (e) {
        console.error(e)
        callback(null)
      }
    })
  }

  companyByTicker(ticker, callback) {
    console.log('companyByTicker:', ticker)
    this.makeAuthenticatedRequest('companies', {ticker: ticker}, (result) => {
      callback(result)
    })
  }

  companyByName(name, callback) {
    console.log('companyByName:', name)

    this.makeAuthenticatedRequest('companies', {query: name}, (result) => {
      callback(result)
    })
  }

  getDatapoint(ticker, tag, callback) {
    console.log('getDatapoint:', ticker, ':', tag)

    this.makeAuthenticatedRequest('data_point', {
      ticker: ticker,
      item: tag
    }, (result) => {
      console.log('getDatapoint done. result:', result)

      callback(result)
    })
  }

  searchForCompanyByTicker(ticker, callback) {
    console.log('searchForCompanyByTicker:', ticker)

    this.makeAuthenticatedRequest('companies', {ticker: ticker}, (result) => {
      callback(result)
    })
  }

  dailyPricesByTicker(ticker, days, callback) {
    console.log('dailyPricesByTicker:', ticker)

    this.makeAuthenticatedRequest('prices', {
      ticker: ticker,
      page_size: days
    }, (result) => {
      callback(result.data)
    })
  }

  historialPricesByTicker(ticker, startDate, endDate, callback) {
    const startDateString = startDate.clone().subtract(7, 'days').format('YYYY-MM-DD')
    const endDateString = endDate.format('YYYY-MM-DD')

    console.log('historialPricesByTicker:', ticker, 'startDateString:', startDateString, 'endDateString:', endDateString)

    this.makeAuthenticatedRequest('prices', {
      ticker: ticker,
      start_date: startDateString,
      end_date: endDateString
    }, (result) => {
      console.log('historialPricesByTicker done. result:', result)

      callback(result.data)
    })
  }
}

exports.create = (username, password) => {
  return new IntrinioClient(username, password)
}
