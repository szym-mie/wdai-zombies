class KeyOrderedMap extends Map {
  /**
   * @callback compareFunction
   * @param {*} a first value
   * @param {*} b second value
   * @returns {number} which value is grater
   */

  /**
   * @constructor
   * @param {compareFunction} compareFn key comparing function
   */
  constructor (compareFn) {
    super()
    this.compareFn = compareFn
    this.orderedKeys = new Set([])
  }

  /**
   * Set a value by key.
   * @param {K} key key
   * @param {V} value value to set
   * @returns {KeyOrderedMap<K, V>} this map
   */
  set (key, value) {
    if (!this.orderedKeys.has(key)) {
      const newOrderedKeys = [...this.orderedKeys]
      newOrderedKeys.push(key)
      newOrderedKeys.sort(this.compareFn)
      this.orderedKeys = new Set(newOrderedKeys)
    }
    return super.set(key, value)
  }

  /**
   * Get order index of a key.
   * @param {K} key key to find
   * @returns {number} index of a key
   */
  indexOfKey (key) {
    return [...this.orderedKeys].indexOf(key)
  }

  * [Symbol.iterator] () {
    for (const key of this.orderedKeys) {
      yield [key, this.get(key)]
    }
  }

  * entries () {
    for (const key of this.orderedKeys) {
      yield [key, this.get(key)]
    }
  }

  * keys () {
    for (const key of this.orderedKeys) {
      yield key
    }
  }

  * values () {
    for (const key of this.orderedKeys) {
      yield this.get(key)
    }
  }

  /**
   * Delete an entry by key.
   * @param {K} key key to delete
   * @returns {boolean} was deleted
   */
  delete (key) {
    this.orderedKeys.delete(key)
    return super.delete(key)
  }

  /**
   * Delete an entry by value
   */
  deleteValue (key, value) {
    const values = this.get(key)
    values.delete(value)
  }
}

export default KeyOrderedMap
