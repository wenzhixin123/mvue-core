var mvueCoreConfig = require('../../../config/config.js')

/**
 * 获取所有操作
 * @param projectId
 * @param entityId
 * @param success
 * @param fail
 */
var getOperations = function (projectId, entityId, success, fail) {
  var baseUrl = mvueCoreConfig.getConfigVal('service.metad.api.endpoint')
  var params = {
    'orderby': 'updatedAt desc',
    'filters': 'projectId eq ' + projectId + ' and metaEntityId eq ' + entityId,
    'expand': 'updatedByUser(name)',
    'page': 1,
    'page_size': 1000,
    'total': true
  }

  ax.get(`${baseUrl}/meta_operation`, params, function (res) {
    if (success) {
      success(res)
    }
  }, (err) => {
    if (fail) {
      fail(err)
    }
  })
}

/**
 * 获取某个操作对应的所有页面
 * @param projectId
 * @param operationId
 * @param success
 * @param fail
 */
var getPages4Operation = function (projectId, operationId, success, fail) {
  var baseUrl = mvueCoreConfig.getConfigVal('service.metad.api.endpoint')

  var params = {
    'orderby': 'updatedAt desc',
    // 'filters': 'projectId eq ' + projectId + ' and operation.id eq ' + operationId,
    'filters': 'projectId eq ' + projectId + ' and operationId eq ' + operationId,
    'expand': 'updatedByUser(name)',
    'page': 1,
    'page_size': 1000,
    'total': true
    // 'joins':'metaOperations operation'
  }

  ax.get(`${baseUrl}/mp_page`, params, function (res) {
    if (success) {
      success(res)
    }
  }, (err) => {
    if (fail) {
      fail(err)
    }
  })
}

var getListData = function (baseUrl, entityName, filters, success, fail) {
  var params = {
    'viewId': 'all',
    // 'filters': 'projectId eq ' + projectId + ' and operation.id eq ' + operationId,
    // 'filters': 'projectId eq ' + projectId + ' and operationId eq ' + operationId + (filters ? filters : ''),
    'page': 1,
    'page_size': 1000,
    'total': true
    // 'joins':'metaOperations operation'
  }
//https://saaslinkdev.projects.bingosoft.net:22283/develop_engine/test_dynamic_data?filters=&viewId=all&page=1&page_size=20&total=true
  ax.get(`${baseUrl}/${entityName}`, params, function (res) {
    if (success) {
      success(res)
    }
  }, (err) => {
    if (fail) {
      fail(err)
    }
  })
}

exports.getOperations = getOperations
exports.getPages4Operation = getPages4Operation
exports.getListData = getListData
