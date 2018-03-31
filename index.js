const { MacScanner } = require("mac-scanner")
const Servo = require('./servo')

const servo0 = new Servo(0, (err) => {
  const config = {
    debug: false,
    initial: false, //if false omits initial entering of all available hosts in the network
    network: "192.168.0.1/24",
    concurrency: 50, //amount of ips that are pinged in parallel
    scanTimeout: 5000
  };

  const scanner = new MacScanner(config)
  scanner.start()

  scanner.on("entered", target => {
    console.log("he is here", target.ip, target.mac)
    servo0.setAngle({ end: 0 })
  })

  scanner.on("left", target => {
    console.log('off network', target.ip, target.mac)
    servo0.setAngle({ end: 180 })
  })
})