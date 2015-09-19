/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:log
 * @fileoverview Log a file context on successful completion.
 */

'use strict';

/*
 * Dependencies.
 */

var chalk = require('chalk');
var report = require('vfile-reporter');

/**
 * Check whether `file` is provided by the user.
 *
 * @param {File} file - Virtual file.
 * @return {boolean?} - whether `file` is provided by the
 *   user.
 */
function isProvidedByUser(file) {
    return file.namespace('mdast:cli').providedByUser;
}

/**
 * Output diagnostics to stdout(4) or stderr(4).
 *
 * @param {CLI} context - CLI engine.
 */
function log(context) {
    var files = context.files;
    var applicables = files.filter(isProvidedByUser);
    var diagnostics = report(applicables, {
        'quiet': context.quiet,
        'silent': context.silent
    });

    /*
     * Outputs the reports.
     */

    if (!context.color) {
        diagnostics = chalk.stripColor(diagnostics);
    }

    if (diagnostics) {
        context.stderr(diagnostics);
    }
}

/*
 * Expose.
 */

module.exports = log;
