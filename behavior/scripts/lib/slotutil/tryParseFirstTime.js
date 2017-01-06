'use strict'

const moment = require('moment')
const numeral = require('numeral')

module.exports = function tryParseFirstTime(slotValue) {
  if (!slotValue) {
    return null
  }

  if (!slotValue.parsed) {
    return null
  }

  if (slotValue.parsed.dimension !== 'time') {
    console.warn('Slot value was', slotValue.parsed.dimension, 'not time')
    return null
  }

  if (!slotValue.parsed.results || slotValue.parsed.results.length === 0) {
    return null
  }

  let bestParsedValue = slotValue.parsed.results[0]
  let timestamp = bestParsedValue.value.value
  let parsedTime = moment(timestamp).utc()

  return parsedTime
}
