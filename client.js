const Scanner = require('./scanner')
const Servo = require('./servo')

class Client {
  constructor({ mac, servoID }) {
    this.mac = mac
    this.servoID = servoID
    this.connected = false
    this.disconnectCount = 0
    this.disconnectThreshold = 15
    this.setupServo()
  }

  setupScanner() {
    Scanner.onNetwork({ mac: this.mac, callback: this.onNetwork.bind(this) })
    Scanner.offNetwork({ mac: this.mac, callback: this.offNetwork.bind(this) })
    // Scanner.onEnter({ mac: this.mac, callback: this.onEnter.bind(this) })
    // Scanner.onLeave({ mac: this.mac, callback: this.onLeave.bind(this) })
  }

  setupServo() {
    this.servo = new Servo(this.servoID, this.onServoReady.bind(this))
  }

  onServoReady(status) {
    if (status.success) {
      console.log(`servo ${this.servoID} activated`)
      this.setupScanner()
    } else {
      console.log('error is:', status.error)
    }
  }

  onEnter() {
    console.log('entered', this.mac)
    this.connected = true
    this.disconnectCount = 0
    this.servo.setAngle(180)
  }

  onLeave() {
    console.log('left', this.mac)
    this.connected = false
    this.servo.setAngle(0)
  }

  onNetwork() {
    this.disconnectCount = 0
    if (!this.connected) {
      this.onEnter()
    }
  }

  offNetwork() {
    this.disconnectCount += 1
    if (this.disconnectCount >= this.disconnectThreshold) {
      this.onLeave()
    }
  }
}

module.exports = Client