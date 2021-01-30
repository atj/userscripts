// ==UserScript==
// @name        Add Spotify ISRC link to release pages
// @version     2021.1.30.1
// @description Adds an "import ISRCs" link to release pages with a Spotify URL
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/mb_spotify_isrc_link.user.js
// @updateURL	https://raw.github.com/atj/userscripts/master/mb_spotify_isrc_link.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @match       *://*.musicbrainz.org/release/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==

// prevent JQuery conflicts, see http://wiki.greasespot.net/@grant
this.$ = this.jQuery = jQuery.noConflict(true);

$(document).ready(function () {
    let spotifyLink = $('#release-relationships a[href*="open.spotify.com"]')[0];

    if (spotifyLink === undefined) {
        return;
    }

    let mbId = window.location.href.replace(/^.+\/release\/([-0-9a-f]{36}).*$/i, '$1');
    let spotifyId = spotifyLink.href.replace(/^.+\/album\/([0-9a-z]+)/i, '$1');
    let tatsumoUrl = `https://d.ontun.es?entity=album&id=${spotifyId}&attach=${mbId}`;
    $(spotifyLink.nextElementSibling.nextSibling).after(` [<a href="${tatsumoUrl}" target="_blank">import ISRCs</a>]`);
});
