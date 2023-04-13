// ==UserScript==
// @name          Deezer: Add a-tisket button
// @version       2023.4.13
// @namespace     https://github.com/atj/userscripts
// @author        atj
// @description   Adds an a-tisket import button on Deezer release pages.
// @homepageURL   https://github.com/atj/userscripts#deezer-atisket-button
// @downloadURL   https://raw.github.com/atj/userscripts/main/dist/deezerAtisketButton.user.js
// @updateURL     https://raw.github.com/atj/userscripts/main/dist/deezerAtisketButton.user.js
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

	// name of the custom event that will be triggered when a page load is detected
	const deezerPageLoadEventName = 'deezer-page-load';
	// CSS selector for the page loader bar
	const deezerPageLoaderSelector = '.page-loader-bar';

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
	function dispatchPageLoadEvent(element, data) {
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
	function buildMutationObserver(pageLoaderElement) {
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
	function getListenButtonCssClass() {
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
	function buildAtisketImportUrl(
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

	/**
	 * Creates an a-tisket import button and appends it to the Deezer toolbar.
	 * @param {string} deezerUrl A Deezer release page URL.
	 * @param {string} cssClass CSS class for the button element.
	 * @returns {void}
	 */
	function addAtisketButton(deezerUrl = window.location.href, cssClass) {
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

})();
