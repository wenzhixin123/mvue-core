const utils = {

  /**
   * 浅层数据优先
   */
  findValueFromJSONByDeep (key, json) {
    var res = null

    if (typeof json == 'string') {
    } else if (json.length) {
      for (var index in json) {
        res = utils.findValueFromJSONByDeep(key, json[index])
        if (res) {
          break
        }
      }
    } else {
      for (var tempKey in json) {
        if (tempKey == key) {
          res = json[key]
          break
        } else {
          res = utils.findValueFromJSONByDeep(key, json[tempKey])
          if (res) {
            break
          }
        }
      }
    }

    return res
  }
}
export default utils
