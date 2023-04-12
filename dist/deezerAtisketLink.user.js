// ==UserScript==
// @name          Deezer: Add a-tisket import link
// @version       2023.4.12
// @namespace     https://github.com/atj/userscripts
// @author        atj
// @description   Adds an a-tisket import link on Deezer release pages
// @homepageURL   https://github.com/atj/userscripts#deezer-atisket-link
// @downloadURL   https://raw.github.com/atj/userscripts/main/dist/deezerAtisketLink.user.js
// @updateURL     https://raw.github.com/atj/userscripts/main/dist/deezerAtisketLink.user.js
// @supportURL    https://github.com/atj/userscripts/issues
// @run-at        document-idle
// @match         *://www.deezer.com/*
// ==/UserScript==

(function () {
	'use strict';

	/**
	 * Returns a reference to the first DOM element with the specified value of the ID attribute.
	 * @param {string} elementId String that specifies the ID value.
	 */
	function dom(elementId) {
		return document.getElementById(elementId);
	}

	/**
	 * Returns the first element that is a descendant of node that matches selectors.
	 * @param {string} selectors
	 * @param {ParentNode} node
	 */
	function qs(selectors, node = document) {
		return node.querySelector(selectors);
	}

	/**
	 * Returns a promise that resolves after the given delay.
	 * @param {number} ms Delay in milliseconds.
	 */
	function delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Periodically calls the given function until it returns `true` and resolves afterwards.
	 * @param {(...params) => boolean} pollingFunction
	 * @param {number} pollingInterval
	 */
	function waitFor(pollingFunction, pollingInterval) {
		return new Promise(async (resolve) => {
			while (pollingFunction() === false) {
				await delay(pollingInterval);
			}
			resolve();
		});
	}

	/**
	 * Creates a DOM element from the given HTML fragment.
	 * @param {string} html HTML fragment.
	 */
	function createElement(html) {
		const template = document.createElement('template');
		template.innerHTML = html;
		return template.content.firstElementChild;
	}

	/**
	 * Extracts the entity type and ID from a Deezer URL.
	 * @param {string} url URL of a Deezer entity page.
	 * @returns {[Deezer.EntityType,string]|undefined} Type and ID.
	 */
	function extractEntityFromURL(url) {
		return url.match(/(album|artist)\/(\d+)/)?.slice(1);
	}

	const deezerPageLoadEventName = 'deezer-page-load';

	const atisketUrl = 'https://atisket.pulsewidth.org.uk';
	const atisketCountries = 'GB,US,DE';
	const deezerListenButtonSelector = 'div[data-testid=play] > button';
	const deezerListenButtonClassPrefix = 'css-';
	const atisketButtonId = 'atisket';

	function dispatchPageLoadEvent(element, detail) {
	    element?.dispatchEvent(new CustomEvent(deezerPageLoadEventName, {detail: detail}));
	}

	/**
	 * Initializes and returns a MutationObserver to watch the provided Deezer page loader element for style changes.
	 * @param {Element} pageLoaderElement A Deezer page loader element.
	 * @param {string} eventName Name of the custom event to trigger on the page loader element when a page load is detected.
	 * @returns {MutationObserver}
	 */
	function buildMutationObserver(pageLoaderElement) {
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
	function getListenButtonCssClass() {
	    const classList = qs(deezerListenButtonSelector)?.classList;
	    if (!classList) {
	        return;
	    }

	    return Array.from(classList).find((klass) => klass.startsWith(deezerListenButtonClassPrefix));
	}

	function buildAtisketImportUrl(deezerId, baseUrl = atisketUrl, countries = atisketCountries) {
	    return `${baseUrl}/?preferred_countries=${encodeURIComponent(countries)}&deez_id=${deezerId}`;
	}

	function buildButtonMarkup(atisketUrl, cssClass) {
	    return `
        <div id="${atisketButtonId}" style="margin-left: 16px;">
            <a href="${atisketUrl}" target="_blank">
                <button class="${cssClass}">
                    <span>➞ a-tisket</span>
                </button>
            </a>
        </div>`;
	}

	function addAtisketButton(deezerUrl = window.location.href) {
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

})();
