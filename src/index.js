'use strict'

var fs = require('fs')
var path = require('path')
var Module = require('module')
var callsite = require('callsite')
var enhancedResolve = require('enhanced-resolve')
var extensions = require('./extensions')
var resolveCache = {}

// Expose extensions and loader.
requireAsync.extensions = extensions
requireAsync.resolve = resolveAsync
module.exports = requireAsync

/**
 * Asynchronously require a file and load it into a vm to evaluate it's exports.
 *
 * @param {String} file - The file to require (same as node's require).
 * @param {Object} opts - options to use when requiring a file.
 * @return {Promise}
 */
function requireAsync (file, opts) {
  opts = defaultOptions(opts)
  return resolveAsync(file, opts).then(function (filePath) {
    var cache = require.cache
    var cached = cache[filePath]

    if (opts.cache && cached) {
      // Send out completed require.
      if (cached.loaded) return Promise.resolve(cached.exports)
      // Send out pending require.
      if (cached.promise) return cached.promise
    }

    // Create a new module for the require.
    cached = cache[filePath] = new Module(filePath, require.cache[opts.file])

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
    cached.promise = new Promise(function (resolve, reject) {
      opts.resolve.fileSystem.readFile(filePath, 'utf8', function (err, result) {
        if (err) return reject(err)
        compile(cached, result)
        delete cached.promise
        cached.loaded = true
        resolve(cached.exports)
      })
    })

    // Send out the pending require.
    return cached.promise
  })
}

/**
 * Resolves a file path asynchronously.
 *
 * @param {String} file - The file to resolve (same as node's require.resolve).
 * @param {Object} opts - options to use when resolving a file.
 * @return {Promise}
 */
function resolveAsync (file, opts) {
  opts = defaultOptions(opts)
  var parsed = path.parse(file)
  var id = !parsed.root && !parsed.dir ? parsed.base : path.resolve(opts.directory, file)
  var cached = resolveCache[id]

  if (opts.cache && cached) return cached
  cached = resolveCache[id] = new Promise(function (resolve, reject) {
    enhancedResolve.create(opts.resolve)(opts.directory, file, function (err, filePath) {
      if (err) {
        delete resolveCache[id]
        reject(err)
      } else {
        resolve(filePath)
      }
    })
  })

  return cached
}

/**
 * Builds options with defaults for directories.
 */
function defaultOptions (opts) {
  opts = opts || {}
  opts.resolve = opts.resolve || {}
  opts.resolve.fileSystem = opts.resolve.fileSystem || fs
  opts.file = opts.file || getCallingFile()
  opts.cache = 'cache' in opts ? opts.cache : true
  opts.directory = opts.directory || path.dirname(opts.file)
  return opts
}

/**
 * Gets the file from which a function was called.
 *
 * @return {String}
 */
function getCallingFile () {
  return callsite()[3].getFileName()
}
