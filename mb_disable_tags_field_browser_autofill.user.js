// ==UserScript==
// @name        MusicBrainz: Disable browser autofill on the tags field
// @version     2021.01.31.1
// @author      RetroPunk + atj
// @downloadURL https://raw.github.com/atj/userscripts/main/mb_disable_tags_field_browser_autofill.user.js
// @updateURL	https://raw.github.com/atj/userscripts/main/mb_disable_tags_field_browser_autofill.user.js
// @match       *://*.musicbrainz.org/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==

// check for the tags input element every 250ms
const TimerInterval = 250;
// try 8 times (2 seconds) before giving up
const MaxRetries = 8;

let timerId;
let retryCount = 0;

function disableTagAutocomplete() {
    const tagsInput = document.getElementsByName('tags')[0];

    if (tagsInput === undefined) {
        return false;
    }

    tagsInput.autocomplete = 'off';

    return true;
}

function disableTagAutocompleteTimer() {
    retryCount++;

    if (retryCount >= MaxRetries || disableTagAutocomplete()) {
        clearInterval(timerId);
    }
}

(function () {
    timerId = setInterval(disableTagAutocompleteTimer, TimerInterval);
})();
