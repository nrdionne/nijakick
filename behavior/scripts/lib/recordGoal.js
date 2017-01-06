'use strict'

module.exports = (client) => {
  return client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      let baseClassification = client.getMessagePart().classification.base_type.value

      client.updateConversationState({
        currentGoalStream: client.getStreamName(),
      })

      return 'init.proceed'
    },
  })
}
