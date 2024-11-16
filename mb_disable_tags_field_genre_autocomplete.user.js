// ==UserScript==
// @name        MusicBrainz: Disable the tags field genre autocompletion
// @version     2021.01.31.1
// @author      atj
// @downloadURL https://raw.github.com/atj/userscripts/main/mb_disable_tags_field_genre_autocomplete.user.js
// @updateURL	https://raw.github.com/atj/userscripts/main/mb_disable_tags_field_genre_autocomplete.user.js
// @match       *://*.musicbrainz.org/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==

// the genre autocompletion functionality uses jQuery UI so this script depends
// on jQuery UI being loaded by the current page
(function () {
    if ($ instanceof Function) {
        $(document).ready(function () {
            $('.tag-input').autocomplete('disable');
        });
    }
})();
