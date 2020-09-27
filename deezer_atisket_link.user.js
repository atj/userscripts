// ==UserScript==
// @name        Add a-tisket import link to Deezer
// @version     2020.9.27.1
// @description Adds a link to Deezer to import a release into MusicBrainz via a-tisket
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/deezer_atisket_link.user.js
// @updateURL	https://raw.github.com/atj/userscripts/master/deezer_atisket_link.user.js
// @include     http*://www.deezer.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant       none
// ==/UserScript==

// prevent JQuery conflicts, see http://wiki.greasespot.net/@grant
this.$ = this.jQuery = jQuery.noConflict(true);

// change this to your preferred country codes
const COUNTRIES = encodeURIComponent(`GB,US,DE`);

function addAtisketLink(path) {
    let deezerReleaseId = getReleaseIdFromPath(path);

    if (deezerReleaseId === null) {
        return;
    }

    // remove any old instances of the button in the DOM
    $('#atisket').remove();

    let atisketLink = `https://etc.marlonob.info/atisket/?preferred_countries=${COUNTRIES}&deez_id=${deezerReleaseId}`;
    let atisketButton = $(
        `<div id="atisket" class="toolbar-item">
            <a href="${atisketLink}" target="_blank">
            <button class="root-0-3-1 containedSecondary-0-3-10">
                <span class="label-0-3-2">
                    → a-tisket
                </span>
            </button>
            </a>
        </div>`
    ).hide();

    $('.toolbar-item').last().after(atisketButton);
    atisketButton.show();
}

function getReleaseIdFromPath(path) {
    let matchData = path.match(/^\/[a-z]+\/album\/([0-9]+)[^/]*$/i);

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
        }, 500);

        return pushState.apply(this, arguments);
    };

    window.addEventListener('popstate', function () {
        window.setTimeout(function () {
            addAtisketLink(window.location.pathname);
        }, 500);
    });
})();

$(document).ready(function () {
    // allow 1 second for the Deezer SPA to initialize
    window.setTimeout(function () {
        addAtisketLink(window.location.pathname);
    }, 1000);
});
