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
  // const servo = new Servo(index, (status) => {
  //   if (status.success) {
  //     console.log(`servo ${index} activated`)

  //     Scanner.onEnter({ mac: servoInfo.mac, callback: () => {
  //         servo.setAngle(180)
  //       }
  //     })

  //     Scanner.onLeave({ mac: servoInfo.mac, callback: () => {
  //         servo.setAngle(0)
  //       }
  //     })
  //   } else {
  //     console.log('error is:', status.error)
  //   }
  // })
})
