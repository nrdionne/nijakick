'use strict'

module.exports = (client, state) => {
  return client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().confirmedDatapoint)
    },

    next() {
      return undefined
    },

    prompt(callback) {
      let baseClassification = client.getMessagePart().classification.base_type.value
      let receivedConfirmation = () => {
        client.updateConversationState({
          confirmedDatapoint: client.getConversationState().proposedDatapoint,
          proposedDatapoint: null,
          requestedDatapoint: null,
        })

        callback('init.proceed')
      }

      if (!state.justGotConfirmation) {
        if (baseClassification === 'affirmative' || baseClassification === 'accept') {
          receivedConfirmation()

          return
        } else if (baseClassification === 'decline') {
          client.updateConversationState({
            proposedDatapoint: null,
            confirmedDatapoint: null,
            requestedDatapoint: null,
          })

          client.addTextResponse('So what type of data do you want then?')
          client.done()
        }
      }
      const requestedDatapoint = client.getConversationState().requestedDatapoint

      if (!requestedDatapoint) {
        callback()

        return
      }

      state.datapointDB.searchForDatapoint(state.algoliaClient, requestedDatapoint.value, (results) => {
        if (results.length == 0) {
          client.addTextResponse('That is not a supported datatype, sorry')

          return client.done()
        }

        const proposedDatapoint = results[0]

        client.updateConversationState({
          proposedDatapoint: proposedDatapoint,
        })

        if (results.length == 1) {
          client.updateConversationState({
            confirmedDatapoint: proposedDatapoint,
          })

          return receivedConfirmation()
        }

        client.addTextResponse(`Are you asking for ${proposedDatapoint.name}?`)
        client.expect(client.getStreamName(), ['decline', 'affirmative', 'accept', 'ask_company_data'])
        client.done()
      })
    },
  })
}
