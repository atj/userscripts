// ==UserScript==
// @name        MusicBrainz: Add Spotify ISRC link to release pages
// @version     2021.1.30.2
// @description Adds an "import ISRCs" link to MusicBrainz release pages with a Spotify URL
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/mb_spotify_isrc_link.user.js
// @updateURL	https://raw.github.com/atj/userscripts/master/mb_spotify_isrc_link.user.js
// @match       *://*.musicbrainz.org/release/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==

const SpotifyLinkRegexp = new RegExp(
    '^https?://open.spotify.com/album/([0-9a-z]+)',
    'i'
);

function addImportIsrcsLink() {
    const releaseRels = document.getElementById('release-relationships');

    if (!releaseRels) {
        return;
    }

    let spotifyLink;
    let spotifyId;

    for (const bdi of releaseRels.getElementsByTagName('bdi')) {
        const matches = SpotifyLinkRegexp.exec(bdi.innerText);

        if (matches) {
            spotifyId = matches[1];
            spotifyLink = bdi.parentElement;
            break;
        }
    }

    if (spotifyId === undefined) {
        return;
    }

    const mbId = window.location.href.replace(
        /^.+\/release\/([-0-9a-f]{36}).*$/i,
        '$1'
    );
    let curElem = spotifyLink.nextElementSibling.nextSibling;
    let elem = document.createTextNode(' [');

    curElem = insertAfter(elem, curElem);
    elem = document.createElement('a');
    elem.target = '_blank';
    elem.href = `https://d.ontun.es?entity=album&id=${spotifyId}&attach=${mbId}`;
    elem.innerText = 'import ISRCs';
    curElem = insertAfter(elem, curElem);
    elem = document.createTextNode(']');
    insertAfter(elem, curElem);
}

function insertAfter(elem, after) {
    if (after.parentNode) {
        after.parentNode.insertBefore(elem, after.nextSibling);
    }

    return elem;
}

window.setTimeout(addImportIsrcsLink, 250);
