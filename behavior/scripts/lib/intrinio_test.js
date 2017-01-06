'use strict'

const intrinio = require('./intrinio.js')

function testIntrinioClient() {
  const intrinoClient = intrinio.create('a', 'b')

  intrinoClient.companyByTicker('AAPL', (result) => {
    // console.log('received company result from intrinio:', result)
  })

  intrinoClient.dailyPricesByTicker('AAPL', 3, (result) => {
    console.log('received prices result from intrinio:', result)
  })

  intrinoClient.getDatapoint('AAPL', 'totalrevenue', (result) => {
    console.log('received datapoint result from intrinio:', result)
  })

  intrinoClient.getDatapoint('VZ', 'cashandequivalents', (result) => {
    console.log('received datapoint result from intrinio:', result)
  })
}

testIntrinioClient()
