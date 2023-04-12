import { createElement } from "../utils/dom/create";
import { dom, qs } from "../utils/dom/select";
import { extractEntityFromURL } from "./deezer/entity";

export const deezerPageLoadEventName = 'deezer-page-load';

const atisketUrl = 'https://atisket.pulsewidth.org.uk';
const atisketCountries = 'GB,US,DE';
const deezerListenButtonSelector = 'div[data-testid=play] > button';
const deezerListenButtonClassPrefix = 'css-';
const atisketButtonId = 'atisket';

export function dispatchPageLoadEvent(element, detail) {
    element?.dispatchEvent(new CustomEvent(deezerPageLoadEventName, {detail: detail}));
}

/**
 * Initializes and returns a MutationObserver to watch the provided Deezer page loader element for style changes.
 * @param {Element} pageLoaderElement A Deezer page loader element.
 * @param {string} eventName Name of the custom event to trigger on the page loader element when a page load is detected.
 * @returns {MutationObserver}
 */
export function buildMutationObserver(pageLoaderElement) {
    let loaderWidth = pageLoaderElement.style.width;

    const mo = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
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
        attributeOldValue: false
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

    return Array.from(classList).find((klass) => klass.startsWith(deezerListenButtonClassPrefix));
}

export function buildAtisketImportUrl(deezerId, baseUrl = atisketUrl, countries = atisketCountries) {
    return `${baseUrl}/?preferred_countries=${encodeURIComponent(countries)}&deez_id=${deezerId}`;
}

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

export function addAtisketButton(deezerUrl = window.location.href) {
    const entity = extractEntityFromURL(deezerUrl);

    if (!entity || entity[0] !== 'album') {
        return;
    }

    dom(atisketButtonId)?.remove();

    const buttonCssClass = getListenButtonCssClass();
    if (!buttonCssClass) {
        return;
    }

    qs('div[data-testid=toolbar]')?.append(
        createElement(buildButtonMarkup(buildAtisketImportUrl(entity[1]), buttonCssClass))
    );
}