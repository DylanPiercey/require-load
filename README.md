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
    <img src="https://img.shields.io/npm/v/require-load.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/require-load">
    <img src="https://img.shields.io/npm/dm/require-load.svg?style=flat-square" alt="Downloads"/>
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
  // Result will be the exports of `example.js`, subsequent calls will be cached.
  // You can even get the cached version using plain old require.
  require('./example.js') === result
}).catch(err => {
  // Handle file load error.
})
```

### load.resolve(file: String, options: Object) -> {Promise}
Asynchronously resolve a file path. (Like require.resolve but async.).


```javascript
import { resolve } from 'require-load'

resolve('./example.js').then(fullpath => {
  // Result will be the full path of './example.js'
}).catch(err => {
  // Handle file resolve error.
})
```

## Options (same for both load and load.resolve)

### cache=false (default true)
When the cache option is false the module will be re-evaluated and not cached for the next load call.

```javascript
load('./example.js', { cache: false }).then(result1 => {
  load('./example.js', { cache: false }).then(result2 => {
    result1 !== result2 // Module was not cached.
  })
})
```

### `directory=__dirname` (default relative to the function calling load)

You can optionally choose which directory the resolve files from.
By default this will be relative to where ever this module is required.

```javascript
load('./main.test.js', { directory: __dirname + '/test' }).then(result => {
  // Will resolve modules from the test folder instead of where this was required.
})
```

### `file=__filename` (default relative to the function calling load)

You can also optionally specify a file from which the loader should run. (This also defaults the directory option to be the dirname of the file).

```javascript
load('./main.test.js', { file: __dirname + '/test/custom.test.js' }).then(result => {
  // Will resolve modules relative to the custom.test.js file instead of where this was required.
})
```

### `resolve.fileSystem=MemoryFileSystem` (default to nodeFileSystem.)

You can choose the file system to use when resolving and compiling files. The default will just be the standard 'fs' module but you can also get fancy and use other files systems like 'memory-fs'.

```javascript
import path from 'path'
import MemoryFileSystem from 'memory-fs'
const memoryFs = new MemoryFileSystem()

// Save a file to memory fs.
memoryFs.writeFileSync(path.join(__dirname, './main.test.js'), 'module.exports = "hello world"')

// Load the file from memory.
load('./main.test.js', { resolve: { fileSystem: memoryFs } }).then(result => {
  result === 'hello world'
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
