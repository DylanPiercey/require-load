var path = require('path')
var resolveAsync = require('enhanced-resolve')
var pending = {}

/**
 * Find a file using nodes resolve pattern, returning a promise.
 */
module.exports = function resolve (directory, file) {
  var parsed = path.parse(file)
  var id = !parsed.root && !parsed.dir ? parsed.base : path.join(directory, file)

  pending[id] = pending[id] || new Promise(function (resolve, reject) {
    resolveAsync(global, directory, file, function (err, filePath) {
      delete pending[id]
      if (err) reject(err)
      else resolve(filePath)
    })
  })

  return pending[id]
}
