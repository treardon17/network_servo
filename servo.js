const i2cBus = require("i2c-bus")
const Pca9685Driver = require("pca9685").Pca9685Driver

class Servo {
  constructor(channel, onReady) {
    this.options = {
      i2c: i2cBus.openSync(1),
      address: 0x40,
      frequency: 50,
      debug: false
    }
    this.channel = channel
    this.maxRange = 2500
    this.minRange = 500
    this.currentPos = this.minRange
    this.onReady = onReady
    this.pwm = new Pca9685Driver(this.options, this.onInit.bind(this))

    this.instructionQueue = []
    this.servoActive = false
  }

  onInit(err) {
    this.pos(this.minRange).then(() => {
      if (typeof this.onReady === 'function') { this.onReady({ success: true }) }
    }).catch((err) => {
      if (typeof this.onReady === 'function') {
        this.onReady({ success: false, error: err })
      }
    })
  }

  getServoTimeToPos(pos) {
    const distance = Math.abs(this.currentPos - pos)
    return distance * 5
  }

  addInstruction({ instruction, run }) {
    if (typeof instruction === 'function') {
      this.instructionQueue.push(instruction)
    }
    if (run) {
      this.runInstructionIfNeeded()
    }
  }

  runInstructionIfNeeded() {
    if (this.instructionQueue.length > 0 && !this.servoActive) {
      console.log('instruction count: ', this.instructionQueue.length)
      this.servoActive = true
      this.instructionQueue.shift()().then(() => {
        this.servoActive = false
        this.runInstructionIfNeeded()
      })
    }
  }

  pos(pos) {
    return new Promise((resolve, reject) => {
      const instruction = () => this.setPos(pos).then(resolve).catch(reject)
      this.addInstruction({ instruction, run: true })
    })
  }

  setPos(pos) {
    return new Promise((resolve, reject) => {
      if (this.pwm) {
        let finalPos = pos
        if (pos == 0) { finalPos = 0 }
        else if (!pos) { finalPos = startRange }
        else if (pos > this.maxRange) { finalPos = this.maxRange }
        else if (pos < this.minRange) { finalPos = this.minRange }
        
        console.log('setting pos', finalPos)
        this.pwm.setPulseLength(this.channel, finalPos)
        setTimeout(resolve, this.getServoTimeToPos(finalPos))

        // Keep track of our current position
        this.currentPos = finalPos
      } else { reject() }
    })
  }

  setAngle(angle) {
    const endPos = ((angle / 180) * (this.maxRange - this.minRange)) + this.minRange
    this.pos(endPos)
  }
}

module.exports = Servo