'use strict'

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
        client.addTextResponse(`${result.short_description}`)
        client.done()
        callback()
      })
    },
  })
}
