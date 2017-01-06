'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addTextResponse('Bye')
      client.done()
    },
  })
}
