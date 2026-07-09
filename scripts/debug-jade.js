/**
 * Debug helper: compile server/views/portfolio/index.jade the same way the
 * app does, intercept the `with` transform (where acorn chokes), and print
 * the compiled-JS region around the failure position.
 *
 * Run: node scripts/debug-jade.js
 */
'use strict';
var fs = require('fs');
var path = require('path');
var Module = require('module');

var origRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  var mod = origRequire.apply(this, arguments);
  if (id === 'with') {
    var wrapped = function(obj, src) {
      try {
        return mod.apply(this, arguments);
      } catch (e) {
        var lines = String(src).split('\n');
        var line = (e.loc && e.loc.line) || 183;
        console.error('---- with/acorn error:', e.message);
        console.error('---- compiled JS lines around', line, ':');
        console.error(lines.slice(line - 4, line + 2).join('\n'));
        fs.writeFileSync('/tmp/jade-debug-compiled.js', String(src));
        console.error('---- full compiled source written to /tmp/jade-debug-compiled.js');
        throw e;
      }
    };
    Object.keys(mod).forEach(function(k) { wrapped[k] = mod[k]; });
    return wrapped;
  }
  return mod;
};

var jade = require('jade');
var file = path.join(__dirname, '../server/views/portfolio/index.jade');
try {
  jade.compile(fs.readFileSync(file, 'utf8'), { filename: file });
  console.log('Compiled OK — no error.');
} catch (e) {
  console.error('COMPILE FAILED:', e.message);
  process.exit(1);
}
