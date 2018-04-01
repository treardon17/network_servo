const { MacScanner } = require("mac-scanner")
const Servo = require('./servo')

const servo0 = new Servo(0, (status) => {
  if (status.success) {
    console.log('servo0 activated')

    const config = {
      debug: false,
      initial: false, //if false omits initial entering of all available hosts in the network
      network: "192.168.0.1/24",
      concurrency: 50, //amount of ips that are pinged in parallel
      scanTimeout: 5000
    }

    const scanner = new MacScanner(config)
    scanner.start()

    scanner.on("entered", target => {
      if (target.mac === '') {
        servo0.setAngle(180)
      }
      console.log("he is here", target.ip, target.mac)
    })

    scanner.on("left", target => {
      if (target.mac === '') {
        servo0.setAngle(0)
      }
      console.log('off network', target.ip, target.mac)
    })

  } else {
    console.log('error is:', status.error)
  }
})