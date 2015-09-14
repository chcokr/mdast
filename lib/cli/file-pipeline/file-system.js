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

    var watch = cli.watch && (cli.files.indexOf(file) !== -1);

    if (!watch) {
        debug('Writing document to `%s`', destinationPath);

        file.stored = true;

        writeFile(destinationPath, file.toString(), done);
    } else {
        file.warn([
            '',
            'File is being written to, but is also being watched.',
            'Thus, instead of being written,',
            'the output is being held in memory for you.',
            'When you exit the watch with CTRL+C,',
            'the latest output will be written to the file.'
        ].join('\n'));

        watchOutputCache.add(file);

        done();
    }
}

/*
 * Expose.
 */

module.exports = fileSystem;
