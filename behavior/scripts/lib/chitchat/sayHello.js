'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('welcome/intro')

      client.updateConversationState({helloSent: true})

      client.done()
    },
  })
}
