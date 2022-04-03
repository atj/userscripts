// ==UserScript==
// @name        Add a-tisket import link to Deezer
// @version     2022.04.03.1
// @description Adds a link to Deezer to import a release into MusicBrainz via a-tisket
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/deezer_atisket_link.user.js
// @updateURL	https://raw.github.com/atj/userscripts/master/deezer_atisket_link.user.js
// @match       *://www.deezer.com/*
// @require     https://code.jquery.com/jquery-3.5.1.slim.min.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

// change this to link to a different a-tisket instance
// const ATISKET = `https://etc.marlonob.info/atisket`;
const ATISKET = `https://atisket.pulsewidth.org.uk`;
// change this to your preferred country codes
const COUNTRIES = encodeURIComponent(`GB,US,DE`);

// prevent JQuery conflicts, see http://wiki.greasespot.net/@grant
this.$ = this.jQuery = jQuery.noConflict(true);

function addAtisketLink(path) {
    let deezerReleaseId = getReleaseIdFromPath(path);

    if (deezerReleaseId === null) {
        return;
    }

    // remove any old instances of the button in the DOM
    $('#atisket').remove();

    let atisketLink = `${ATISKET}/?preferred_countries=${COUNTRIES}&deez_id=${deezerReleaseId}`;
    let atisketButton = $(
        `<div id="atisket" class="_2cOQ6">
            <a href="${atisketLink}" target="_blank">
            <button class="hACRDz" style="padding:0px 16px;">
                <span class="fZCKwv">
                    ➞ a-tisket
                </span>
            </button>
            </a>
        </div>`
    ).hide();

    $('div[data-testid="toolbar"] > div').last().after(atisketButton);

    atisketButton.show();
}

function getReleaseIdFromPath(path) {
    let matchData = path.match(/^\/[a-z]+\/album\/([0-9]+)/i);

    if (matchData !== null) {
        return matchData[1];
    }

    return null;
}

// Intercept pushState and popstate so that the script works with the Deezer SPA
(function () {
    const pushState = History.prototype.pushState;

    History.prototype.pushState = function () {
        let path = arguments[2];
        window.setTimeout(function () {
            addAtisketLink(path);
        }, 1000);

        return pushState.apply(this, arguments);
    };

    window.addEventListener('popstate', function () {
        window.setTimeout(function () {
            addAtisketLink(window.location.pathname);
        }, 1000);
    });
})();

$(document).ready(function () {
    // allow 1 second for the Deezer SPA to initialize
    window.setTimeout(function () {
        addAtisketLink(window.location.pathname);
    }, 1500);
});
