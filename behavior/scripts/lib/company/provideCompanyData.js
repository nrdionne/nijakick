'use strict'

const moment = require('moment')
const numeral = require('numeral')

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt(callback) {
      const datapointType = client.getConversationState().confirmedDatapoint
      const confirmedTickerString = client.getConversationState().confirmedTickerString

      state.intrinioClient.getDatapoint(confirmedTickerString, datapointType.tag, (result) => {
        let format, displayValue

        if (!result) {
          client.addTextResponse('There was a problem getting that statistic, sorry')

          return client.done()
        }

        let value = result.value
        switch (datapointType.format) {
          case 'percent':
            format = '0.00%'
            displayValue = numeral(value).format(format)
            break
          case 'ratio':
            format = '0.00'
            displayValue = numeral(value).format(format)
            break
          case 'date':
            displayValue = moment.utc(value).hour(17).calendar(null, state.responseDateFormat)
            break
          case 'number':
            format = '0,0'
            displayValue = numeral(value).format(format)
            break
          case 'string':
            displayValue = value
            break
          default:
            format = '$0.00a'
            displayValue = numeral(value).format(format)
        }

        client.addTextResponse(`The ${datapointType.name.toLowerCase()} for ${confirmedTickerString} is ${displayValue}`)

        client.done()
      })
    },
  })
}
