'use strict'

module.exports = (client) => {
    return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      console.log('Received exclamation, ignoring')
      client.done()
    },
  })
}
