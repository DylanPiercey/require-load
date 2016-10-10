<h1 align="center">
  Require-Load
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/require-load">
    <img src="https://img.shields.io/npm/v/dylanpiercey/require-load.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/require-load">
    <img src="https://img.shields.io/npm/dm/dylanpiercey/require-load.svg?style=flat-square" alt="Downloads"/>
  </a>
</h1>

An asynchronous module loader for nodejs that integrates with the existing module system.

## Installation

#### Npm
```bash
npm install require-load
```

## API

### load(file: String, options: Object) -> {Promise}
Asynchronously require a specific file. File name resolution works exactly the same as the native `require` function.


```javascript
import load from 'require-load'

load('./example.js').then(result => {
  // Result will be the exports of `example.js`
  // Subsequent calls will be cached.
}).catch(err => {
  // Handle file load error.
})
```

## Options

### cache=false (default true)
When the cache option is false the module will be re-evaluated and not cached for the next load call.

```javascript
load('./example.js', { cache: false }).then(result1 => {
  load('./example.js', { cache: false }).then(result2 => {
    result1 !== result2 // Module was not cached.
  })
})
```

### path=directory (default relative to module.parent)

You can optionally choose which directory the resolve files from.
By default this will be relative to where ever this module is required.

```javascript
load('./main.test.js', { path: __dirname + '/test' }).then(result => {
  // Will resolve modules from the test folder instead of where this was required.
})
```

## Clearing the cache
Clearing a file from the cache is the exact same as any other node module (once the file has loaded).

```javascript
  load('./example.js').then(result => {
    // Remove from the require cache manually.
    delete require.cache[require.resolve('./example.js')]
  })
```

## Custom extensions
Just like node's require you can add or overwrite the file extensions, however instead of calling the extension function with a filename it will be called with the file's contents.

```javascript
// A naive babel loader for babel es6 files.
import babel from 'babel-core'
load.extensions['.es6'] = function parseCustomFile (module, script) {
  module._compile(babel.transform(script), module.filename)
}
```

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
