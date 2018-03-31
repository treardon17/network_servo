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
    this.maxRange = 500
    this.minRange = 0
    this.prevRange = this.minRange
    this.onReady = onReady
    this.pwm = new Pca9685Driver(this.options, this.onInit.bind(this))
  }

  onInit(err) {
    this.pwm.setPulseLength(this.channel, 450)
    this.setRange({ start: this.minRange, end: this.minRange }).then(() => {
      if (typeof this.onReady === 'function') { this.onReady({ success: true }) }
    }).catch((err) => {
      if (typeof this.onReady === 'function') {
        this.onReady({ success: false, error: err })
      }
    })
  }

  setRange({ start, end }) {
    return new Promise((resolve, reject) => {
      if (this.pwm) {
        let startRange = start || this.prevRange
        if (startRange < this.minRange) { startRange = this.minRange }

        const endRange = (end > this.maxRange ? this.maxRange : end)
        this.prevRange = endRange

        // Set channel 0 to turn on on step 42 and off on step 255
        // (with optional callback)
        this.pwm.setPulseRange(this.channel, startRange, endRange, (err) => {
          if (err) { reject(err) }
          else {
            setTimeout(() => {
              resolve()
            }, 2000)
          }
        })
      } else {
        reject()
      }
    })
  }

  setAngle({ start, end }) {
    return new Promise((resolve, reject) => {
      const startRange = ((start || this.prevRange) / 180) * 500
      const endRange = (end / 180) * 500
      this.setRange({ start: startRange, end: endRange }).then(resolve).catch(reject)
    })
  }
}

module.exports = Servo