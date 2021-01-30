// ==UserScript==
// @name        Add a-tisket import link to Spotify
// @version     2021.1.30.1
// @description Adds a link to Spotify to import a release into MusicBrainz via a-tisket
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/spotify_atisket_link.user.js
// @updateURL   https://raw.github.com/atj/userscripts/master/spotify_atisket_link.user.js
// @match       *://open.spotify.com/*
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
    let spotifyReleaseId = getReleaseIdFromPath(path);

    if (spotifyReleaseId === null) {
        return;
    }

    // remove any old instances of the button in the DOM
    $('#atisket').remove();

    let atisketLink = `${ATISKET}/?preferred_countries=${COUNTRIES}&spf_id=${spotifyReleaseId}`;
    let atisketButton = $(
        `<button type="button" id="atisket" class="_07bed3a434fa59aa1852a431bf2e19cb-scss" style="padding:6px;border:1px solid;border-radius:5px;">
            <a href="${atisketLink}" target="_blank">
                → a-tisket
            </a>
        </button>`
    ).hide();

    $('button[title="More"]').first().before(atisketButton);
    atisketButton.show();
}

function getReleaseIdFromPath(path) {
    let matchData = path.match(/^\/album\/([0-9a-z]+)[^/]*$/i);

    if (matchData !== null) {
        return matchData[1];
    }

    return null;
}

// Intercept pushState and popstate so that the script works with the Spotify SPA
(function () {
    window.history.pushState = function () {
        let path = arguments[2];
        window.setTimeout(function () {
            addAtisketLink(path);
        }, 500);
    };

    window.addEventListener('popstate', function () {
        window.setTimeout(function () {
            addAtisketLink(window.location.pathname);
        }, 500);
    });
})();

$(document).ready(function () {
    // allow 1 second for the Spotify SPA to initialize
    window.setTimeout(function () {
        addAtisketLink(window.location.pathname);
    }, 1000);
});
