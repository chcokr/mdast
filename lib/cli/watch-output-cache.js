var debug = require('debug')('mdast:cli:watch:output-cache');
var fs = require('fs');
var path = require('path');

var cache = {};

/**
 * Add a VFile to the cache so that its content can later be used.
 *
 * @param {VFile} file - The file to add to the cache.
 */
function add(file) {
    var absolutePath =
        path.resolve(file.directory, file.filename + '.' + file.extension);

    cache[absolutePath] = file;

    debug('File has been added to watchOutputCache: %s', absolutePath);
}

/**
 * Write to all the files in the cache.
 * This function is synchronous.
 */
function writeAll() {
    Object.keys(cache).forEach(function (path) {
        var file = cache[path];

        var destinationPath = file.filePath();

        debug('Writing document to `%s`', destinationPath);

        file.stored = true;

        // It might be tempting to use the async version fs.writeFile here,
        // but that comes with a lot of additional complexity, especially in
        // terms of coordinating order between chokidar and file writes.
        // For example, if you switch this to the async version, you will
        // notice that the target files end up turning blank, because closing
        // out chokidar's watcher will terminate the process too early before
        // the files are written to.
        // Leaving this in the synchronous version here is strongly suggested.
        fs.writeFileSync(destinationPath, file.toString());
    });

    debug('All the outputs held in memory have been written to the files!');
}

module.exports.add = add;
module.exports.writeAll = writeAll;
