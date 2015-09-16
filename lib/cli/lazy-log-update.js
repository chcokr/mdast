/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:lazy-log-update
 * @fileoverview Maintain a cache of outputs to files that are being watched
 *  and were also going to be written to.
 */

'use strict';

/*
 * Dependencies.
 */

var logUpdate;

/**
 * `logUpdate` without the unexpected control-characters.
 *
 * @see https://github.com/wooorm/mdast/pull/57
 * @see https://github.com/sindresorhus/log-update/issues/2
 */
function lazy() {
    if (!logUpdate) {
        logUpdate = require('log-update');
    }

    logUpdate.apply(null, arguments);
}

/*
 * Expose.
 */

module.exports = lazy;
