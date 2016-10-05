'use strict'

var fs = require('mz/fs')
var path = require('path')
var Module = require('module')
var resolve = require('./resolve')
var extensions = require('./extensions')

// Do not return cached versions of this module since we must know the parent module.
delete require.cache[__filename]

// Expose extensions and loader.
requireEnsure.extensions = extensions
module.exports = requireEnsure

/**
 * Asynchronously require a file and load it into a vm to evaluate it's exports.
 *
 * @param {String} file - The file to require (same as node's require).
 * @param {Object} opts - options to use when requiring a file.
 * @return {Promise}
 */
function requireEnsure (file, opts) {
  opts = opts || {}
  var skipCache = opts.cache === false
  var directory = opts.path || path.dirname(module.parent.filename)

  return resolve(directory, file).then(function (filePath) {
    var cache = require.cache
    var cached = cache[filePath]

    if (!skipCache && cached) {
      // Send out completed require.
      if (cached.loaded) return Promise.resolve(cached.exports)
      // Send out pending require.
      if (cached.promise) return cached.promise
    }

    // Create a new module for the require.
    cached = cache[filePath] = new Module(filePath, module.parent)

    // Create a sandbox to run the script in.
    var fileDirectory = path.dirname(filePath)
    var fileExt = path.extname(filePath) || '.js'
    var compile = extensions[fileExt]

    // Check for supported file extension.
    if (typeof compile !== 'function') {
      throw new Error('Could not async require file with unsupported extension: ' + fileExt)
    }

    // Initialize paths on the module.
    cached.filename = filePath
    cached.paths = Module._nodeModulePaths(fileDirectory)

    // Load the file and save the pending promise in the require cache.
    cached.promise = fs.readFile(filePath, 'utf8').then(function (script) {
      compile(cached, script)
      delete cached.promise
      cached.loaded = true
      return cached.exports
    })

    // Send out the pending require.
    return cached.promise
  })
}
