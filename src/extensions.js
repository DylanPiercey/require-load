var stripBOM = require('strip-bom')

/**
 * Parse a .js script and expose module.exports.
 *
 * @params {Module} module - the module for the script.
 * @params {String} script - the script to parse
 */
exports['.js'] = function (module, script) {
  module._compile(stripBOM(script), module.filename)
}

/**
 * Parse a .json script and expose module.exports.
 *
 * @params {Module} module - the module for the script.
 * @params {String} script - the script to parse
 */
exports['.json'] = function (module, script) {
  try {
    module.exports = JSON.parse(stripBOM(script))
  } catch (err) {
    err.message = module.filename + ': ' + err.message
    throw err
  }
}
