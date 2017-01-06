'use strict'

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().confirmedTickerString)
    },

    prompt(callback) {
      let baseClassification = client.getMessagePart().classification.base_type.value
      let receivedConfirmation = () => {
        state.justGotConfirmation = true

        client.updateConversationState({
          confirmedTickerString: client.getConversationState().proposedTickerString,
          proposedTickerString: null,
        })

        callback('init.proceed')
      }

      if (baseClassification === 'affirmative' || baseClassification === 'accept') {
        receivedConfirmation()

        return
      } else if (baseClassification === 'decline') {
        client.updateConversationState({
          requestedCompanyName: null,
          requestedTicker: null,
        })

        client.addTextResponse('Okay, what is the ticker of the company?')
        client.done()
        callback()
      }

      const nameOrTicker = client.getConversationState().requestedCompanyName || client.getConversationState().requestedTicker

      state.companyDB.searchForCompany(state.algoliaClient, nameOrTicker.value, (results) => {
        if (results.length == 0) {
          client.addTextResponse(`${nameOrTicker.value} did not match a known company, so please restate that`)

          return client.done()
        }

        const firstResult = results[0]
        const lowerQuery = nameOrTicker.value.trim().toLowerCase()

        client.updateConversationState({
          proposedTickerString: firstResult.ticker,
        })

        let autoConfirm = (
          firstResult.ticker.toLowerCase() === lowerQuery ||
          results.length === 1 ||
          (
            firstResult.name.toLowerCase().indexOf(lowerQuery) > -1 && // First result contains query, but second does not
            results[1].name.toLowerCase().indexOf(lowerQuery) === -1
          )
        )

        if (autoConfirm) {
          receivedConfirmation()

          callback('init.proceed')
        } else {
          client.addResponse('ask_confirm/company', {company_name: firstResult.name.trim(), ticker_symbol: firstResult.ticker})

          client.expect(client.getStreamName(), ['decline', 'affirmative', 'accept', 'provide_info', 'switch_company'])
          client.done()
        }
      })
    },
  })
}
