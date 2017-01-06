'use strict'

module.exports = (client) => {
	return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('error/request_rephrase')

      client.done()
    },
  })
}
