/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-pipeline:read
 * @fileoverview Read a file if not already filled.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var debug = require('debug')('mdast:cli:file-pipeline:read');

/*
 * Methods.
 */

var readFile = fs.readFile;

/*
 * Constants.
 */

var ENCODING = 'utf-8';

/**
 * Fill a file with its contents when not already filled.
 *
 * @example
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md'
 *   });
 *
 *   read({'file': file}, console.log);
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function read(context, done) {
    var file = context.file;
    var filePath = file.filePath();

    if (file.contents || file.hasFailed()) {
        done();
    } else {
        debug('Reading `%s` in `%s`', filePath, ENCODING);

        readFile(filePath, ENCODING, function (err, contents) {
            debug('Read `%s` (err: %s)', filePath, err);
            file.contents = contents || '';

            done(err);
        });
    }
}

/*
 * Expose.
 */

module.exports = read;
