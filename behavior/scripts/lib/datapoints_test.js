'use strict'

const datapointDB = require('./datapoints.js')

function test_searchForDatapoint() {
  const tests = [
    {q: 'total income', tag: 'netincome'},
    {q: 'total loss', tag: 'netincome'},
    {q: 'revenue', tag: 'totalrevenue'},
  ]

  tests.forEach(test => {
    datapointDB.searchForDatapoint(test.q, result => {
      console.log(`Result for ${test.t}:`, result)
      if (test.tag && result && result.length > 0 && result[0].tag === test.tag) {
        console.warn('SUCCESS:', test.q, 'expected', test.tag)
      } else if (!test.tag && result.length === 0) {
        console.warn('SUCCESS:', test.q, 'expected', test.tag)
      } else {
        console.warn('FAIL:', test.q, 'expected', test.tag, 'got', result)
      }
    })
  })
}

test_searchForDatapoint()
