const { MacScanner } = require("mac-scanner")
const Servo = require('./servo')
const ServoConfig = require('./servo-config')

const config = {
  debug: false,
  initial: false, //if false omits initial entering of all available hosts in the network
  network: "192.168.0.1/24",
  concurrency: 50, //amount of ips that are pinged in parallel
  scanTimeout: 5000
}
const scanner = new MacScanner(config)
scanner.start()

ServoConfig.forEach((servoInfo, index) => {
  const servo = new Servo(index, (status) => {
    if (status.success) {
      console.log(`servo ${index} activated`)
  
      scanner.on("entered", target => {
        if (target.mac === servoInfo.mac) {
          servo.setAngle(180)
          console.log(`servo ${index} entered`, target.ip, target.mac)
        }
      })
  
      scanner.on("left", target => {
        if (target.mac === servoInfo.mac) {
          servo.setAngle(0)
          console.log(`servo ${index} left`, target.ip, target.mac)
        }
      })
  
    } else {
      console.log('error is:', status.error)
    }
  })
})
