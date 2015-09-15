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

var charm = require('charm')();
charm.pipe(process.stdout);

var chalk = require('chalk');
var logUpdate = require('log-update');
var report = require('vfile-reporter');

/**
 * Output diagnostics to stdout(4) or stderr(4).
 *
 * @param {CLI} context - CLI engine.
 */
function log(context) {
    var files = context.files;
    var applicables = files.filter(function (file) {
        return file.namespace('mdast:cli').providedByUser;
    });

    if (!context.watch) {
        processReport();
    } else {
        // Clear out the spinner. See also ../index.js
        logUpdate('');
        charm.up(1);

        /*
         * We add a little time interval before reports are printed out,
         * because without the interval, the logUpdate('') above seems to
         * also eat up the last line of the plugins' output.
         */
        setTimeout(processReport, 100);
    }

    /**
     * Outputs the reports.
     */
    function processReport() {
        var diagnostics = report(applicables, {
            'quiet': context.quiet,
            'silent': context.silent
        });

        if (!context.color) {
            diagnostics = chalk.stripColor(diagnostics);
        }

        if (diagnostics) {
            context.stderr(diagnostics);
        }
    }
}

/*
 * Expose.
 */

module.exports = log;
