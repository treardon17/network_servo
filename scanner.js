const ArpScan = require('arpscan')
const Util = require('./util')

class Scanner {
  constructor() {
    this.config = {
      debug: false,
      initial: false, //if false omits initial entering of all available hosts in the network
      network: "192.168.0.1/24",
      concurrency: 50, //amount of ips that are pinged in parallel
      scanTimeout: 1000
    }

    this.devicesOnNetwork = []
    this.enterListeners = {}
    this.leaveListeners = {}
    this.onNetworkListeners = {}
    this.offNetworkListeners = {}
    this.scanInterval = 5000
    this.scanIntervalID = null
    this.refreshNetwork()
  }

  start() {
    this.refreshNetwork(true)
  }

  stop() {
    clearTimeout(this.scanIntervalID)
  }

  get listeningIDs() {
    const enter = Object.keys(this.enterListeners)
    const leave = Object.keys(this.leaveListeners)
    const onNetwork = Object.keys(this.onNetworkListeners)
    const offNetwork = Object.keys(this.offNetworkListeners)
    return Util.arrayUnique([...enter, ...leave, ...onNetwork, ...offNetwork])
  }

  scanNetwork() {
    return new Promise((resolve, reject) => {
      ArpScan((err, data) => {
        if (err || !data) { reject(err) }
        const currentDevices = data.map(device => device.mac.toUpperCase())
        const expiredDevices = Util.arrayDifference({ array1: this.devicesOnNetwork, array2: currentDevices })
        const newDevices = Util.arrayDifference({ array1: currentDevices, array2: this.devicesOnNetwork })
        const expiredListening = Util.arrayDifference({ array1: this.listeningIDs, array2: currentDevices })
        resolve({ current: currentDevices, expired: expiredDevices, new: newDevices, expiredListening })
      })
    })
  }

  refreshNetwork(loop) {
    this.scanNetwork().then((data) => {
      // console.log(data)
      this.devicesOnNetwork = data.current
      this.notify({ macs: data.new, eventName: 'deviceEntered' })
      this.notify({ macs: data.expired, eventName: 'deviceLeft' })
      this.notify({ macs: data.current, eventName: 'deviceOnNetwork' })
      this.notify({ macs: data.expiredListening, eventName: 'deviceOffNetwork' })
      if (loop) {
        this.scanIntervalID = setTimeout(this.refreshNetwork.bind(this, true), this.scanInterval)
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  notify({ macs, eventName }) {
    macs.forEach(mac => {
      const event = this[eventName].bind(this)
      if (typeof event === 'function') {
        event({ mac })
      }
    })
  }

  onEnter({ callback, mac }) {
    return this.addListener({ callback, mac, listenContainer: 'enterListeners' })
  }

  onLeave({ callback, mac }) {
    return this.addListener({ callback, mac, listenContainer: 'leaveListeners' })
  }

  onNetwork({ callback, mac }) {
    const id = this.addListener({ callback, mac, listenContainer: 'onNetworkListeners' })
    if (this.devicesOnNetwork.indexOf(mac.toUpperCase()) !== -1) {
      this.deviceOnNetwork({ mac })
    }
    return id
  }

  offNetwork({ callback, mac }) {
    return this.addListener({ callback, mac, listenContainer: 'offNetworkListeners' })
  }

  addListener({ callback, mac, listenContainer }) {
    let id = mac || Util.guid()
    id = id.toUpperCase()
    this[listenContainer][id] = callback
    return id
  }

  // EVENTS
  deviceOnNetwork(event) {
    const callback = this.onNetworkListeners[event.mac]
    if (typeof callback === 'function') { callback(event) }
  }

  deviceOffNetwork(event) {
    const callback = this.offNetworkListeners[event.mac]
    if (typeof callback === 'function') { callback(event) }
  }

  deviceEntered(event) {
    console.log('entered:', event.mac)
    const callback = this.enterListeners[event.mac]
    if (typeof callback === 'function') { callback(event) }
  }

  deviceLeft(event) {
    console.log('left:', event.mac)
    const callback = this.leaveListeners[event.mac]
    if (typeof callback === 'function') { callback(event) }
  }
}

module.exports = new Scanner()