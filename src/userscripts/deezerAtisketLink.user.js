import { qs } from '../../utils/dom/select.js';
import { waitFor } from '../../utils/async/polling.js';
import {
    addAtisketButton,
    buildMutationObserver,
    deezerPageLoadEventName,
    dispatchPageLoadEvent
} from '../deezerAtisketLink.js';

const deezerPageLoaderSelector = '.page-loader-bar';

waitFor(() => qs(deezerPageLoaderSelector) !== null).then(() => {
    const pageLoader = qs(deezerPageLoaderSelector);

    pageLoader.addEventListener(deezerPageLoadEventName, (event) => {
        const href = event.detail;
        if (href !== window.location.href) {
            return;
        }

        addAtisketButton();
    });

    // manually triggering the event at this stage fails as getListenButtonCssClass() fails
    dispatchPageLoadEvent(pageLoader, window.location.href);
    buildMutationObserver(pageLoader);
});