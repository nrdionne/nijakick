'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('you_are_welcome')
      return client.done()
    },
  })
}
