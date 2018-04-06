// const { MacScanner } = require("mac-scanner")
const Servo = require('./servo')
const Scanner = require('./scanner')
const ServoConfig = require('./servo-config')
const Client = require('./client')

Scanner.start()
const clients = []

ServoConfig.forEach((servoInfo, index) => {
  const client = new Client({ mac: servoInfo.mac, servoID: index })
  clients.push(client)
})
