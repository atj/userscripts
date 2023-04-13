import { createElement } from '@kellnerd/musicbrainz-scripts/utils/dom/create.js';
import { dom, qs } from '@kellnerd/musicbrainz-scripts/utils/dom/select.js';
import { extractEntityFromURL } from './deezer/entity.js';

// name of the custom event that will be triggered when a page load is detected
export const deezerPageLoadEventName = 'deezer-page-load';
// CSS selector for the page loader bar
export const deezerPageLoaderSelector = '.page-loader-bar';

const defaultAtisketUrl = 'https://atisket.pulsewidth.org.uk';
const defaultAtisketCountries = 'GB,US,DE';

const deezerListenButtonSelector = 'div[data-testid=play] > button';
const deezerToolbarSelector = 'div[data-testid=toolbar]';
const deezerListenButtonClassPrefix = 'css-';
const atisketButtonId = 'atisket';

/**
 * Dispatches a custom Deezer page load event on the provided element.
 * @param {Element} element The element to dispatch the event on.
 * @param {any} data Data to include with the dispatched event.
 */
export function dispatchPageLoadEvent(element, data) {
    element?.dispatchEvent(
        new CustomEvent(deezerPageLoadEventName, { detail: data })
    );
}

/**
 * Initializes and returns a MutationObserver to watch the provided Deezer page loader element for style changes.
 * @param {Element} pageLoaderElement A Deezer page loader element.
 * @param {string} eventName Name of the custom event to trigger on the page loader element when a page load is detected.
 * @returns {MutationObserver}
 */
export function buildMutationObserver(pageLoaderElement) {
    let loaderWidth = pageLoaderElement.style.width;

    const mo = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            const newWidth = mutation.target.style.width;

            if (loaderWidth === '100%' && newWidth == '0%') {
                dispatchPageLoadEvent(pageLoaderElement, window.location.href);
            }

            loaderWidth = newWidth;
        });
    });

    mo.observe(pageLoaderElement, {
        attribute: true,
        attributeFilter: ['style'],
        attributeOldValue: false,
    });

    return mo;
}

/**
 * Retrieves the CSS class with the prefix "css-" from the Deezer "Listen" button.
 * @returns {string|undefined}
 */
export function getListenButtonCssClass() {
    const classList = qs(deezerListenButtonSelector)?.classList;
    if (!classList) {
        return;
    }

    return Array.from(classList).find(klass =>
        klass.startsWith(deezerListenButtonClassPrefix)
    );
}

/**
 * Returns an a-tisket URL that will load the provided Deezer release.
 * @param {string} releaseId A Deezer release ID to include in the returned URL.
 * @param {string} baseUrl A base URL for an a-tisket instance.
 * @param {string} countries A comma separated list of country codes.
 * @returns {string}
 */
export function buildAtisketImportUrl(
    releaseId,
    baseUrl = defaultAtisketUrl,
    countries = defaultAtisketCountries
) {
    return `${baseUrl}/?preferred_countries=${encodeURIComponent(
        countries
    )}&deez_id=${releaseId}`;
}

/**
 * Returns HTML markup for a toolbar button which links to the given URL.
 * @param {string} atisketUrl An a-tisket URL.
 * @param {string} cssClass CSS class for the button element.
 * @returns {string}
 */
export function buildButtonMarkup(atisketUrl, cssClass) {
    return `
        <div id="${atisketButtonId}" style="margin-left: 16px;">
            <a href="${atisketUrl}" target="_blank">
                <button class="${cssClass}">
                    <span>➞ a-tisket</span>
                </button>
            </a>
        </div>`;
}

/**
 * Creates an a-tisket import button and appends it to the Deezer toolbar.
 * @param {string} deezerUrl A Deezer release page URL.
 * @param {string} cssClass CSS class for the button element.
 * @returns {void}
 */
export function addAtisketButton(deezerUrl = window.location.href, cssClass) {
    const entity = extractEntityFromURL(deezerUrl);

    if (!entity || entity[0] !== 'album') {
        return;
    }

    dom(atisketButtonId)?.remove();

    qs(deezerToolbarSelector)?.append(
        createElement(
            buildButtonMarkup(buildAtisketImportUrl(entity[1]), cssClass)
        )
    );
}
