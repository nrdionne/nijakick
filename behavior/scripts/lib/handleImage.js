'use strict'

module.exports = (client) => {
  return () => {
    const messagePart = client.getMessagePart()

    if (messagePart.content_type === client.constants.MessageTypes.IMAGE) {
      console.log('client.getMessagePart().content:', client.getMessagePart().content)

      let imageCaption = null

      if (client.getMessagePart().content && client.getMessagePart().content.understanding && client.getMessagePart().content.understanding.captions) {
        let captions = client.getMessagePart().content.understanding.captions

        if (captions.length > 0) {
          imageCaption = captions[0].text
        }
      }

      if (imageCaption) {
        client.addTextResponse(`This is a finance app, so images are a little out of scope, but that looks like ${imageCaption}`)
      } else {
        client.addTextResponse('This is a finance app, so images are a little out of scope')
      }

      client.addResponse('provide_help/overview')
      client.done()

      return true
    }
  }
}
