'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      const baseClassification = client.getMessagePart().classification.base_type.value

      if (baseClassification === 'reject_answer') {
        console.log('in getHelp because of reject answer')
        client.addResponse('error/request_polite_rephrase')
      } else {
        console.log('in getHelp')
        client.addResponse('provide_help/overview')
      }

      client.done()
    },
  })
}
