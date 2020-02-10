// -----------------------------------------------------------------------------
// This file creates a build in the dist/ folder
// -----------------------------------------------------------------------------

(async function() {

  // libraries
  const fs = require('fs-plus');
  const csso = require('csso');
  const uglify = require('uglify-js');
  const util = require('util');
  const readFileAsync = util.promisify(fs.readFile);
  const writeFileAsync = util.promisify(fs.writeFile);
  const removeAsync = util.promisify(fs.remove);
  const makeTreeAsync = util.promisify(fs.makeTree);

  const encoding = {encoding: 'utf8'};

  const package = JSON.parse(await readFileAsync('package.json', encoding));
  const version = package.version;
  const year = new Date().getFullYear();
  const cssSrc = (await readFileAsync('lib/chessboard.css', encoding))
                  .replace('@VERSION', version);
  const jsSrc = (await readFileAsync('lib/chessboard.js', encoding))
                  .replace('@VERSION', version)
                  .replace('RUN_ASSERTS = true', 'RUN_ASSERTS = false');

  // TODO: need to remove the RUN_ASSERTS calls from the non-minified file

  const minifiedCSS = csso.minify(cssSrc).css;
  const uglifyResult = uglify.minify(jsSrc);
  const minifiedJS = uglifyResult.code;

  // quick sanity checks
  console.assert(!uglifyResult.error, 'error minifying JS!');
  console.assert(typeof minifiedCSS === 'string' && minifiedCSS !== '', 'error minifying CSS!');

  // add license to the top of minified files
  const minifiedJSWithBanner = banner() + minifiedJS;

  // create a fresh dist/ folder
  await removeAsync('dist');
  await makeTreeAsync('dist');

  // copy lib files to dist/
  await writeFileAsync('dist/chessboard-' + version + '.css', cssSrc, encoding);
  await writeFileAsync('dist/chessboard-' + version + '.min.css', minifiedCSS, encoding);
  await writeFileAsync('dist/chessboard-' + version + '.js', jsSrc, encoding);
  await writeFileAsync('dist/chessboard-' + version + '.min.js', minifiedJSWithBanner, encoding);

  function banner () {
    return '/*! chessboard.js v' + version + ' | (c) ' + year + ' Chris Oakman | MIT License chessboardjs.com/license */\n'
  }

}());
