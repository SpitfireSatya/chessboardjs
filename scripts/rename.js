// TODO: this is unfinished / not working

(async function() {

  var fs = require('fs');
  var glob = require('glob');
  const util = require('util');
  const readFileAsync = util.promisify(fs.readFile);
  const writeFileAsync = util.promisify(fs.writeFile);

  var exampleFiles = glob.sync('examples/*.example');

  exampleFiles.forEach(await processFile);

  async function processFile (f) {
    var fileContents = await readFileAsync(f, {encoding:'utf8'});
    var lines = fileContents.split('\n');

    lines = lines.map(processLine);

    await writeFileAsync(f, lines.join('\n'));
  }

  function processLine (line) {
    line = line.replace('docs#', 'docs.html#');
    return line;
}

}());
