'use strict'

const companyDB = require('./companies.js')

function test_CompanySearchByTicker() {
  const tests = [
    {q: 'GM', t: 'GM'},
    {q: 'gM ', t: 'GM'},
    {q: 'aapl', t: 'AAPL'},
    {q: '12312312', t: null},
  ]

  tests.forEach(test => {
    companyDB.searchForCompanyByTicker(null, test.q, result => {
      // console.log(`Result for ${test.t}:`, result)
      if (test.t && result && result.ticker === test.t) {
        console.warn('SUCCESS:', test.q, 'expected', test.t)
      } else if (!test.t && !result) {
        console.warn('SUCCESS:', test.q, 'expected', test.t)
      } else {
        console.warn('FAIL:', test.q, 'expected', test.t, 'got', result)
      }
    })
  })
}

function test_searchForCompany() {
  const tests = [
    {q: 'general motors', t: 'GM'},
    {q: 'apple compyter', t: 'AAPL'},
    {q: 'berkshire hath', t: 'BRK.A'},
    {q: 't', t: 'T'},
    {q: 'at and t', t: 'T'},
  ]

  tests.forEach(test => {
    companyDB.searchForCompany(test.q, result => {
      // console.log(`Result for ${test.t}:`, result)
      if (test.t && result && result.length > 0 && result[0].ticker === test.t) {
        console.warn('SUCCESS:', test.q, 'expected', test.t)
      } else if (!test.t && result.length === 0) {
        console.warn('SUCCESS:', test.q, 'expected', test.t)
      } else {
        console.warn('FAIL:', test.q, 'expected', test.t, 'got', result)
      }
    })
  })
}

test_CompanySearchByTicker()
test_searchForCompany()
