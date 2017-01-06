'use strict'

const url = require('url')

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return false
    },

    next() {
      return undefined
    },

    prompt(callback) {
      const confirmedTickerString = client.getConversationState().confirmedTickerString
      const nameOrTicker = client.getConversationState().requestedCompanyName || client.getConversationState().requestedTicker

      state.intrinioClient.companyByTicker(confirmedTickerString, (result) => {
        let actions = []
        let description = ''
        let logoUrl = null
        const companyUrl = result.company_url

        if (companyUrl) {
          const parsedUrl = url.parse(companyUrl)

          if (parsedUrl && parsedUrl.host) {
            logoUrl = state.imgixClient.buildURL(
              `https://logo.clearbit.com/${parsedUrl.host}`,
              {
                w: 764,
                h: 400,
                fit: 'fill',
                bg: 'FFFFFF'
              }
            )
          }
        }

        if (result.ticker) {
          if (result.stock_exchange) {
            description += `${result.ticker} (${result.stock_exchange})\n`
          } else {
            description += `${result.ticker}\n`
          }
        }

        if (result.industry_category) {
          description += `${result.industry_category}\n`
        }

        if (companyUrl) {
          actions.push({
            type: 'link',
            text: 'Company website ',
            uri: companyUrl,
          })
        }

        actions.push({
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
        })

        actions.push({
          type: 'postback',
          text: 'Charts',
          payload: {
            stream: 'provideChart',
            version: '1',
            data: {
              action: 'request_chart',
              ticker: result.ticker,
            },
          },
        })

        let carousel = {
          items: [
            {
              title: `${result.name}`,
              description: description,
              'media_url': logoUrl,
              'media_type': 'image/png',
              actions: actions,
            },
          ],
        }

        client.addCarouselListResponse(carousel)
        client.done()
        callback()
      })
    },
  })
}
