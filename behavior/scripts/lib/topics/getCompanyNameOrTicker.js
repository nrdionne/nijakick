'use strict'

module.exports = (client, state) => {
  return client.createStep({
    extractInfo() {
      const companyName = state.firstOfEntityRole(client.getMessagePart(), 'company_name')
      const ticker = state.firstOfEntityRole(client.getMessagePart(), 'ticker_symbol')

      if (companyName) {
        client.updateConversationState({
          requestedCompanyName: companyName,
          confirmedTickerString: null,
        })
      } else if (ticker) {
        client.updateConversationState({
          requestedCompanyName: null,
        })
      }

      if (ticker) {
        client.updateConversationState({
          requestedTicker: ticker,
          confirmedTickerString: null,
        })
      } else if (companyName) {
        client.updateConversationState({
          requestedTicker: null,
        })
      }
    },

    satisfied() {
      return (
        Boolean(client.getConversationState().requestedCompanyName) ||
        Boolean(client.getConversationState().requestedTicker)
      )
    },

    prompt() {
      client.addResponse('ask_info/company_name')
      client.expect(client.getStreamName(), ['decline', 'affirmative', 'accept', 'provide_info'])
      client.done()
    },
  })
}
