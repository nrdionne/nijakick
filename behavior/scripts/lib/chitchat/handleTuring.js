'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      switch (client.getMessagePart().classification.sub_type.value) {
        case 'request_human':
          client.addTextResponse('Finit is completely automated service with no human involvment that helps with stocks')
          break
        default:
          client.addTextResponse('Finit is an automated service that helps with stocks')
      }

      return 'init.proceed'
    },
  })
}
