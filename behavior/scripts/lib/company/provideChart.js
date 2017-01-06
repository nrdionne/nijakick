'use strict'

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return false
    },

    next() {
      return undefined
    },

    extractInfo() {
      const chartRange = state.firstOfEntityRole(client.getMessagePart(), 'duration/chart_range')

      if (chartRange && chartRange.parsed) {
        client.updateConversationState({
          requestChartRange: chartRange,
        })
      }
    },

    prompt(callback) {
      let selectedChartRange, selectedChartRangeName
      const confirmedTickerString = client.getConversationState().confirmedTickerString
      const nameOrTicker = client.getConversationState().requestedCompanyName || client.getConversationState().requestedTicker
      let time12m = state.imgixClient.buildURL(
        `http://chart.finance.yahoo.com/z?s=${confirmedTickerString}&t=1y&q=l&l=on&z=l&p=m50,m400`,
        {
          w: 764,
          h: 400,
          fit: 'fill',
          bg: 'FFFFFF',
        }
      )
      let time1m = state.imgixClient.buildURL(
        `http://chart.finance.yahoo.com/z?s=${confirmedTickerString}&t=1m&q=l&l=on&z=l&p=m5`,
        {
          w: 764,
          h: 400,
          fit: 'fill',
          bg: 'FFFFFF'
        }
      )
      let time1d = state.imgixClient.buildURL(
        `http://chart.finance.yahoo.com/z?s=${confirmedTickerString}&t=1d&q=l&l=on&z=l`, {
          w: 764,
          h: 400,
          fit: 'fill',
          bg: 'FFFFFF'
        }
      )
      const chartRangeValue = client.getConversationState().requestChartRange

      if (chartRangeValue && chartRangeValue.parsed && chartRangeValue.parsed) {
        if (chartRangeValue.parsed.results && chartRangeValue.parsed.results.length > 0) {
          let bestRangeParse = chartRangeValue.parsed.results[0]

          /*
            Valid chart ranges
            1d
            -
            15d

            1m
            2m
            3m
            4m
            5m
            6m
            7m
            8m
            9m
            1y
          */
          let intDay
          let intMonth
          let intYear

          switch (bestRangeParse.value.unit) {
            case 'day':
              intDay = Math.floor(bestRangeParse.value.value)

              if (intDay >= 2 && intDay <= 15) {
                selectedChartRange = `${intDay}d`
                selectedChartRangeName = `${intDay} days`
              } else if (intDay < 2) {
                selectedChartRange = '1d'
                selectedChartRangeName = '1 day'
              } else if (intDay < 30) {
                selectedChartRange = '1m'
                selectedChartRangeName = '1 month'
              } else {
                intMonth = Math.floor(intMonth / 30)
                if (intMonth < 1) {
                  intMonth = 1
                }
              }
              if (selectedChartRange) {
                break
              } // fallthrough
            case 'month':
              if (!intMonth) {
                intMonth = Math.floor(bestRangeParse.value.value)
              }
              if (intMonth >= 2 && intMonth <= 9) {
                selectedChartRange = `${intMonth}m`
                selectedChartRangeName = `${intMonth} months`
              } else if (intMonth < 2) {
                selectedChartRange = '1m'
                selectedChartRangeName = '1 month'
              } else if (intMonth < 13) {
                selectedChartRange = '1y'
                selectedChartRangeName = '1 year'
              } else {
                intYear = Math.floor(intMonth / 12) + 1
              }
              if (selectedChartRange) {
                break
              } // fallthrough
            case 'year':
              if (!intYear) {
                intYear = Math.floor(bestRangeParse.value.value)
              }
              if (intYear >= 2 && intYear <= 5) {
                selectedChartRange = `${intYear}m`
                selectedChartRangeName = `${intYear} years`
              } else if (intYear < 2) {
                selectedChartRange = '1y'
                selectedChartRangeName = '1 year'
              } else if (intYear >= 5) {
                selectedChartRange = '5y'
                selectedChartRangeName = '5 years'
              }
            default:
              selectedChartRange = '7d'
              selectedChartRangeName = 'Seven days'
          }
        }
      }

      state.intrinioClient.companyByTicker(confirmedTickerString, (result) => {
        let carousel = {items: []}

        if (selectedChartRange && selectedChartRangeName) {
          let generatedChartURL = state.imgixClient.buildURL(
            `http://chart.finance.yahoo.com/z?s=${confirmedTickerString}&t=${selectedChartRange}&q=l&l=on&z=l`,
            {
              w: 764,
              h: 400,
              fit: 'fill',
              bg: 'FFFFFF'
            }
          )

          carousel.items = [
            {
              title: selectedChartRangeName,
              description: `Price history of ${confirmedTickerString}`,
              media_url: generatedChartURL,
              media_type: 'image/png',
              actions: [
                {
                  type: 'postback',
                  text: 'Current price',
                  payload: {
                    stream: 'providePrice',
                    version: '1',
                    data: {
                      action: 'request_price',
                      ticker: result.ticker,
                    },
                  },
                },
              ],
            },
          ]
        } else {
          carousel.items = [
            {
              title: '1 day',
              description: `Price history of ${confirmedTickerString}`,
              media_url: time1d,
              media_type: 'image/png',
              actions: [
                {
                  type: 'postback',
                  text: 'Current price',
                  payload: {
                    stream: 'providePrice',
                    version: '1',
                    data: {
                      action: 'request_price',
                      ticker: result.ticker,
                    },
                  },
                },
              ],
            },
            {
              title: '1 month',
              description: `Price history of ${confirmedTickerString}`,
              media_url: time1m,
              media_type: 'image/png',
              actions: [
                {
                  type: 'postback',
                  text: 'Current price',
                  payload: {
                    stream: 'providePrice',
                    version: '1',
                    data: {
                      action: 'request_price',
                      ticker: result.ticker,
                    },
                  },
                },
              ],
            },
            {
              title: '12 months',
              description: `Price history of ${confirmedTickerString}`,
              media_url: time12m,
              media_type: 'image/png',
              actions: [
                {
                  type: 'postback',
                  text: 'Current price',
                  payload: {
                    stream: 'providePrice',
                    version: '1',
                    data: {
                      action: 'request_price',
                      ticker: result.ticker,
                    },
                  },
                },
              ],
            },
          ]
        }

        client.addCarouselListResponse(carousel)
        client.done()
        callback()
      })
    },
  })
}
