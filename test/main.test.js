var path = require('path')
var assert = require('assert')
var requireAsync = require('..')

describe('require-ensure', function () {
  it('should async require modules', function () {
    assert.equal(module.children.length, 1, 'Should have 1 child')

    return Promise.all([
      requireAsync('./examples/export-values'),
      requireAsync('./examples/module-export-function'),
      requireAsync('./examples/module-export-object')
    ]).then(function (modules) {
      assert.equal(modules.length, 3, 'Should have found 3 modules.')
      assert.equal(module.children.length, 4, 'Should have 4 children.')
      assert.deepEqual(modules[0], { a: 1, b: 2 }, 'Should have got export-values module.')
      assert.equal(modules[1].name, 'test', 'Should have got module-export-function module.')
      assert.deepEqual(modules[2], { a: 1, b: 2 }, 'Should have got module-export-object module.')

      return Promise.all([
        requireAsync('./examples/export-values'),
        requireAsync('./examples/module-export-function'),
        requireAsync('./examples/module-export-object')
      ]).then(function (modulesCopy) {
        assert.equal(modulesCopy[0], modules[0], 'Cached export-values.')
        assert.equal(modulesCopy[1], modules[1], 'Cached module-export-function.')
        assert.equal(modulesCopy[2], modules[2], 'Cached module-export-object.')
      })
    })
  })

  it('should require from provided path', function () {
    return requireAsync('./export-values', { directory: path.join(__dirname, 'examples') }).then(function (it) {
      assert.deepEqual(it, { a: 1, b: 2 }, 'Should have got export-values module.')
    })
  })

  it('should require from node_modules', function () {
    return requireAsync('callsite').then(function (it) {
      assert.ok(typeof it === 'function', 'should be a function.')
    })
  })

  it('should cache required modules', function () {
    return requireAsync('./examples/export-values').then(function (it1) {
      return requireAsync('./examples/export-values').then(function (it2) {
        assert.equal(it1, it2, 'Should have cached the module.')
        delete require.cache[require.resolve('./examples/export-values')]
        return requireAsync('./examples/export-values').then(function (it3) {
          assert.notEqual(it2, it3, 'Should have cleared the cache.')
        })
      })
    })
  })

  it('should not cache required modules when cache option is false', function () {
    return requireAsync('./examples/export-values', { cache: false }).then(function (it1) {
      return requireAsync('./examples/export-values', { cache: false }).then(function (it2) {
        assert.notEqual(it1, it2, 'Should not have cached the module.')
      })
    })
  })

  it('should work across files', function () {
    return Promise.all([
      require('./examples/submodule-require'),
      requireAsync('./examples/export-values')
    ]).then(function (results) {
      assert.equal(results[0], results[1], 'Should not be cached.')
    })
  })

  it('should be able to override the file system.', function () {
    var MemoryFileSystem = require('memory-fs')
    var fs = new MemoryFileSystem()
    fs.writeFileSync('/test.js', 'module.exports = 2;')
    return requireAsync('/test.js', { resolve: { fileSystem: fs } }).then(function (it) {
      assert.equal(it, 2, 'should read from memory')
    })
  })
})
