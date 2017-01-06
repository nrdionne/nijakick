'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      console.log('Out of domain query')

      client.addResponse('state_out_of_domain')

      return 'init.proceed'
    },
  })
}
