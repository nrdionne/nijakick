'use strict'

const moment = require('moment')

const Pusher = require('pusher')
const ImgixClient = require('imgix-core-js')

const intrinio = require('./lib/intrinio')
const companyDB = require('./lib/companies.js')
const datapointDB = require('./lib/datapoints.js')

// ----------------------------------------------------------------------------------
// Configurable constants used within steps
// ----------------------------------------------------------------------------------
const responseDateFormat = {
  sameDay: '[today]',
  nextDay: '[tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[yesterday]',
  lastWeek: '[last] dddd',
  sameElse: 'MMMM Do',
}

if (moment().utc().hour() < 8) {
  // Early morning UTC, use exact date
  responseDateFormat.sameDay = 'MMMM Do'
  responseDateFormat.lastDay = 'MMMM Do'
  responseDateFormat.nextDay = 'MMMM Do'
}

// ----------------------------------------------------------------------------------
// This uses Pusher to emit data for remote display and is for demonstration only
// See: https://pusher.com/
// ----------------------------------------------------------------------------------
function emitClientOverPusher(client, next) {
  const env = client.getCurrentApplicationEnvironment()

  const pusherClient = new Pusher({
    appId: env.pusher.appId,
    key: env.pusher.key,
    secret: env.pusher.secret,
    encrypted: true,
  })

  const pusherEvent = {
    messagePart: client.getMessagePart(),
  }

  const smoochUserID = client.getMessagePart().sender.remote_id
  const channelName = `smooch-user-${smoochUserID}`

  pusherClient.trigger(channelName, 'messagePart', pusherEvent, (error) => {
    if (error) {
      console.error('Error sending event to Pusher', error)
    }

    next()
  })
}

// ----------------------------------------------------------------------------------
// This demo emits data over Pusher to external resources for display.
// Typically the handle function would run the logic invocation directly.
// ----------------------------------------------------------------------------------
exports.handle = function handle(client) {
  emitClientOverPusher(client, () => {
    exports.runLogicInvocation(client)
  })
}

exports.runLogicInvocation = function runLogicInvocation(client) {
  const env = client.getCurrentApplicationEnvironment()
  const imgixClient = new ImgixClient({
    host: env.imgix.host,
    secureURLToken: env.imgix.token,
  })
  const intrinioClient = intrinio.create(env.intrinio.username, env.intrinio.password)

  // Dependencies to share between steps
  const dependencies = {
    responseDateFormat: responseDateFormat,
    intrinioClient: intrinioClient,
    imgixClient: imgixClient,
    tryParseFirstTime: require('./lib/slotutil/tryParseFirstTime'),
    companyDB: companyDB,
    datapointDB: datapointDB,
    firstOfEntityRole: require('./lib/slotutil/firstOfEntityRole'),
    justGotConfirmation: false,
    algoliaClient: require('./lib/algoliaClient').create(env.algolia.a, env.algolia.secret),
  }

  // Include steps while injecting dependencies
  const sayHello = require('./lib/chitchat/sayHello')(client, dependencies)
  const sayGoodbye = require('./lib/chitchat/goodbye')(client, dependencies)
  const untrained = require('./lib/chitchat/untrained')(client, dependencies)
  const getCompanyNameOrTicker = require('./lib/topics/getCompanyNameOrTicker')(client, dependencies)
  const confirmCompany = require('./lib/topics/confirmCompany')(client, dependencies)
  const provideCompanySummary = require('./lib/company/provideCompanySummary')(client, dependencies)
  const providePrice = require('./lib/company/providePrice')(client, dependencies)
  const provideVolume = require('./lib/company/provideVolume')(client, dependencies)
  const getDatapointType = require('./lib/topics/getDatapointType')(client, dependencies)
  const confirmDatapointType = require('./lib/topics/confirmDatapointType')(client, dependencies)
  const provideCompanyData = require('./lib/company/provideCompanyData')(client, dependencies)
  const sayYouAreWelcome = require('./lib/chitchat/sayYouAreWelcome')(client, dependencies)
  const getHelp = require('./lib/chitchat/getHelp')(client, dependencies)
  const provideChart = require('./lib/company/provideChart')(client, dependencies)
  const recordGoal = require('./lib/recordGoal')(client, dependencies)
  const returnToGoal = require('./lib/returnToGoal')(client, dependencies)
  const outOfDomain = require('./lib/chitchat/outOfDomain')(client, dependencies)
  const handleTuring = require('./lib/chitchat/handleTuring')(client, dependencies)
  const handleImage = require('./lib/handleImage')(client, dependencies)

  const resetUser = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.resetUser()
      return client.done()
    },
  })

  // ----------------------------------------------------------------------------------
  // Check Message for contentType and confidence
  // ----------------------------------------------------------------------------------
  const messagePart = client.getMessagePart()

  if (handleImage()) { // Returns true if message was handled image, after calling client.done()
    return
  }

  if (messagePart.classification.overall_confidence < 0.15) {
    client.addResponse('error/request_rephrase')
    client.done()

    return
  }

  client.runFlow({
    classifications: {
      'request_information': 'providePrice',
      'request_information/company': 'providePrice',
      'request_price': 'providePrice',
      'request_volume': 'provideVolume',
      'request_chart': 'provideChart',
      'ask_company_data': 'provideData',
      'thanks': 'handleThanks',
      'goodbye': 'sayGoodbye',
      'exclamation': 'handleExclamation',
      'swear': 'handleExclamation',
      'help': 'getHelp',
      'out_of_domain': 'outOfDomain',
      'greeting': 'getHelp',
      'provide_info': 'returnToGoal',
      'turing': 'handleTuring',
      'switch_company': 'returnToGoal',
      'start_over': 'startOver',
    },
    streams: {
      main: 'onboarding',
      onboarding: [sayHello],
      handleThanks: [sayYouAreWelcome],
      sayGoodbye: [sayGoodbye],
      getHelp: [getHelp],
      handleTuring: [handleTuring, 'getHelp'],
      outOfDomain: [outOfDomain, 'getHelp'],
      startOver: [resetUser],
      returnToGoal: [returnToGoal],
      getCompany: [getCompanyNameOrTicker, confirmCompany],
      companyInfo: [recordGoal, 'getCompany', provideCompanySummary],
      companyDescription: [recordGoal, 'getCompany', provideCompanySummary],
      provideChart: [recordGoal, 'getCompany', provideChart],
      providePrice: [recordGoal, 'getCompany', providePrice],
      provideVolume: [recordGoal, 'getCompany', provideVolume],
      provideData: [recordGoal, 'getCompany', getDatapointType, confirmDatapointType, provideCompanyData],
      end: [untrained],
    },
  })
}
