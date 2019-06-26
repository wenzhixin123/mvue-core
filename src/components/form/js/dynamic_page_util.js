var findIds = function (refs) {
  var dynRef = refs.dynamicPage.$refs
  var childWidgets = this.findChildRef('childWidgets', dynRef)
  var refs = []
  var ids = []
  this.findProOrFun('getWidgetContext', childWidgets, refs)
  for (var i in refs) {
    var ref = refs[i]
    var widgetContext = ref.getWidgetContext()
    if (widgetContext.selectedIds) {
      for (var j in widgetContext.selectedIds) {
        ids.push(widgetContext.selectedIds[j])
      }
    }
  }
  return ids
}

var findChildRef = function (key, refs) {
  var res = null
  for (var k in refs) {
    var ref = refs[k]
    if (k == key) {
      return ref
    } else {
      for (var i in ref) {
        var item = ref[i]
        if (item.$refs) {
          var temp = this.findChildRef(key, item.$refs)
          if (temp) {
            res = temp
          }
        }
      }
    }
  }
  return res
}

var findProOrFun = function (key, refs, res) {
  for (var k in refs) {
    var ref = refs[k]
    if (ref[key]) {
      res.push(ref)
    }
    if (ref.$refs) {
      this.findProOrFun(key, ref.$refs)
    }
  }
}

exports.findIds = findIds
exports.findChildRef = findChildRef
exports.findProOrFun = findProOrFun
