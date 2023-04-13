import { qs } from '@kellnerd/musicbrainz-scripts/utils/dom/select.js';
import { waitFor } from '@kellnerd/musicbrainz-scripts/utils/async/polling.js';
import {
    addAtisketButton,
    buildMutationObserver,
    deezerPageLoadEventName,
    deezerPageLoaderSelector,
    dispatchPageLoadEvent,
    getListenButtonCssClass,
} from '../deezerAtisketButton.js';

let buttonCssClass;

waitFor(
    () => (buttonCssClass = getListenButtonCssClass()) !== undefined,
    500
).then(() => {
    const pageLoader = qs(deezerPageLoaderSelector);
    if (pageLoader === null) {
        console.log(
            "ERROR: Couldn't find the page loader element, please file a bug report!"
        );
        return;
    }

    pageLoader.addEventListener(deezerPageLoadEventName, event => {
        const pageURL = window.location.href;
        // ensure the user hasn't navigated to a different page (needed?)
        if (event.detail !== pageURL) {
            return;
        }

        addAtisketButton(pageURL, buttonCssClass);
    });

    // an event won't be dispatched on initial pageload so trigger one manually
    dispatchPageLoadEvent(pageLoader, window.location.href);
    buildMutationObserver(pageLoader);
});
