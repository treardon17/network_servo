class Util {
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  arrayDifference({ array1, array2 }) {
    return array1.filter(x => !array2.includes(x))
  }

  arrayIntersection({ array1, array2 }) {
    return array1.filter(x => array2.includes(x))
  }

  arrayUnique(array, property){
    if (property) {
      return [...new Set(array.map(item => item[property]))]
    }
    return [...new Set(array)]
  }
}

module.exports = new Util()