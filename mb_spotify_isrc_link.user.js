// ==UserScript==
// @name        MusicBrainz: Add Spotify ISRC link to release pages
// @version     2024.11.16.1
// @description Adds an "import ISRCs" link to MusicBrainz release pages with a Spotify URL
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/main/mb_spotify_isrc_link.user.js
// @updateURL	https://raw.github.com/atj/userscripts/main/mb_spotify_isrc_link.user.js
// @match       *://*.musicbrainz.org/release/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==

const SpotifyLinkRegexp = new RegExp(
    '^https?://open.spotify.com/album/',
    'i'
);
const DeezerLinkRegexp = new RegExp(
    '^https?://www.deezer.com/album/',
    'i'
);

/**
 * Adds an "import ISRCs" link next to the given link element.
 * @param {HTMLElement} linkElement - The link element to add the "import ISRCs" link after.
 * @param {string} type - The type of service ("spotify" or "deezer").
 * @param {string} id - The ID of the album.
 */
function addImportLink(linkElement, type, id) {
    const isrcHuntUrl = `https://isrchunt.com/${type}/importisrc?releaseId=${id}`;
    // ISRCHunt doesn't require an MBID
    // const mbId = window.location.href.replace(
    //     /^.+\/release\/([-0-9a-f]{36}).*$/i,
    //     '$1'
    // );
    let curElem = linkElement.nextElementSibling.nextSibling;
    let elem = document.createTextNode(' [');
    curElem = insertAfter(elem, curElem);
    elem = document.createElement('a');
    elem.target = '_blank';
    elem.href = isrcHuntUrl;
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

function addImportIsrcsLink() {
    const releaseRels = document.getElementById('release-relationships');

    if (!releaseRels) {
        return;
    }

    for (const bdi of releaseRels.getElementsByTagName('bdi')) {
        let matches = bdi.innerText.match(SpotifyLinkRegexp);
        if (matches) {
            const spotifyId = bdi.innerText.split('/').pop();
            const spotifyLink = bdi.parentElement;
            addImportLink(spotifyLink, 'spotify', spotifyId);
        }

        matches = bdi.innerText.match(DeezerLinkRegexp);
        if (matches) {
            const deezerId = bdi.innerText.split('/').pop();
            const deezerLink = bdi.parentElement;
            addImportLink(deezerLink, 'deezer', deezerId);
        }
    }
}

window.setTimeout(addImportIsrcsLink, 250);
