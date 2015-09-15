/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-pipeline:file-system
 * @fileoverview Write a file to the file system.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var debug = require('debug')('mdast:cli:file-pipeline:file-system');
var watchOutputCache = require('../watch-output-cache');

/*
 * Methods.
 */

var writeFile = fs.writeFile;

/**
 * Write a virtual file to the file-system.
 * Ignored when `output` is not given.
 *
 * @example
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md',
 *     'contents': '# Hello'
 *   });
 *
 *   file.providedByUser = true;
 *
 *   fileSystem({
 *     'output': true,
 *     'file': file
 *   });
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function fileSystem(context, done) {
    var file = context.file;
    var destinationPath;

    if (!context.output) {
        debug('Ignoring writing to file-system');

        done();

        return;
    }

    if (!file.namespace('mdast:cli').providedByUser) {
        debug('Ignoring programmatically added file');

        done();

        return;
    }

    destinationPath = file.filePath();

    if (!destinationPath) {
        debug('Ignoring file without output location');

        done();

        return;
    }

    var cli = context.fileSet.cli;

    var watch = cli.watch && // cli.watch checks whether --watch flag is used
        /*
         * It is important that we compare destinationPath against
         * fileSet.sourcePaths - it is essential to understand what each of
         * these two means in this context.
         *
         * fileSet.sourcePaths, as discussed in ../index.js, represents the
         * files we are watching.
         *
         * destinationPath represents the path to which something is about to
         * get written to.
         *
         * So what the following check means is "the file that is about to be
         * written to is also being watched."
         */
        (context.fileSet.sourcePaths.indexOf(destinationPath) !== -1);

    if (!watch) {
        debug('Writing document to `%s`', destinationPath);

        file.stored = true;

        writeFile(destinationPath, file.toString(), done);
    } else {
        watchOutputCache.add(file);

        done();
    }
}

/*
 * Expose.
 */

module.exports = fileSystem;
