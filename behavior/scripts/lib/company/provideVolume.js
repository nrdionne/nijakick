'use strict'

const moment = require('moment')
const numeral = require('numeral')

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return false
    },

    extractInfo() {
      const volumeTime = state.firstOfEntityRole(client.getMessagePart(), 'time/volume_time')


      if (volumeTime && volumeTime.parsed) {
        client.updateConversationState({
          requestedVolumeTime: volumeTime,
        })
      }
    },

    next() {
      return undefined
    },

    prompt(callback) {
      let volumeTime
      const confirmedTickerString = client.getConversationState().confirmedTickerString
      const nameOrTicker = client.getConversationState().requestedCompanyName || client.getConversationState().requestedTicker
      const today = moment().utc()
      let isToday = false
      let isFuture = false

      if (client.getMessagePart().classification.sub_type.value !== 'current') {
        let requestedVolumeTime = client.getConversationState().requestedVolumeTime || client.getConversationState().requestedPriceTime

        if (requestedVolumeTime) {
          volumeTime = state.tryParseFirstTime(requestedVolumeTime)

          if (!volumeTime) {
            // Could not parse time
            client.addTextResponse('What date do you want the volume for?')
            callback()
          } else {
            if (volumeTime.isSame(today, 'day')) {
              isToday = true
            } else if (volumeTime.isAfter(today, 'day')) {
              isFuture = true

              client.addTextResponse('Please provide a calendar date, in the past, to clarify when you mean')
              callback()
              client.done()
            }
          }
        }
      }

      let returnVolume = function returnVolume(dayVolumeResult) {
        let responseType = 'provide_volume'
        let volumeData = {
          'time/volume_time': moment.utc(dayVolumeResult.date).hour(17).calendar(null, state.responseDateFormat),
          'volume': `${numeral(dayVolumeResult.volume).format('0,0')}`,
          'ticker_symbol': confirmedTickerString,
        }

        client.addResponse(responseType, volumeData)
        callback()
        client.done()
      }

      if (volumeTime) {
        state.intrinioClient.historialPricesByTicker(confirmedTickerString, volumeTime, volumeTime, (result) => {
          if (result.length === 0) {
            client.addTextResponse('Could not get results')
            client.done()

            return
          }

          returnVolume(result[0])
        })
      } else {
        state.intrinioClient.dailyPricesByTicker(confirmedTickerString, 5, (result) => {
          if (result.length === 0) {
            client.addTextResponse('Could not get results')
            client.done()
            return
          }

          returnVolume(result[0])
        })
      }
    },
  })
}
