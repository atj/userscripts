// ==UserScript==
// @name        MusicBrainz: Semi-automate adding "remixer" and "remix of" credits
// @version     2021.1.21.1
// @description Adds links to the relationship editor that semi-automate adding "remixer" and "remix-of" credits
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/mb_add_remix_credit_links.user.js
// @updateURL   https://raw.github.com/atj/userscripts/master/mb_add_remix_credit_links.user.js
// @match       http*://*.musicbrainz.org/release/*/edit-relationships
// @grant       none
// ==/UserScript==

/* Examples of track titles that this regex should match:
 *
 * Nepalese Bliss (Jimpster mix)
 * Earth Is the Place (FK edit)
 * Right by Your Side (Restless Soul Aquarius mix)
 * Animal (DJ Martin & DJ Homes' Primordial Jungle mix)
 * HNNY - Hotline Riddim (Jacques Renault edit)
 * Master Boogie Song & Dance - Roll the Joint (Joey Negro re-edit)
 * I Got It (Kenny Dope edit)
 * Manzel - It's Over Now (MAW remix dub)
 * Open Your Eyes (New Phunk Theory's Little Green dub)
 * Black Truffles in the Snow (Mike Huckaby's S Y N T H remix)
 * Detroit Swindle - Yes, No, Maybe (Sterac Electronics instrumental remix)
 */
const TitleRemixRegexp = /^\s*(.+)\s+\(\s*(.+)\s+(?:(?:re)?mix|re-?(?:[dr]ub|edit)|edit).*\)/i;

// <option value="153">&nbsp;&nbsp;remixer</option>
const RemixerOptionValue = '153';
// <option value="230">&nbsp;&nbsp;remix of</option>
const RemixOfOptionValue = '230';

// This code is based on:
// https://stackoverflow.com/questions/42795059/programmatically-fill-reactjs-form
function setElementValue(element, value, event = 'input') {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
    const valueSetter = propertyDescriptor === undefined ? null : propertyDescriptor.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }

    element.dispatchEvent(new Event(event, { bubbles: true }));
}

function addLinksToRecordings() {
    const recordings = document.getElementsByClassName('recording');

    for (const recording of recordings) {
        const title = recording.getElementsByTagName('bdi')[0].innerText;
        let matches = TitleRemixRegexp.exec(title);
        if (matches === null) {
            continue;
        }

        let linkTypes = {};
        // find existing relationship types for this recording
        for (const link of recording.getElementsByClassName('link-phrase')) {
            linkTypes[link.innerText] = 1;
        }

        let span = document.createElement('span');
        span.setAttribute('data-rel', 'remixer');
        if (linkTypes['remixer']) {
            span.className = 'btn disabled';
        } else {
            span.className = 'btn';
            span.onclick = addCreditClickHandler;
            span.setAttribute('data-remixer', matches[2]);
        }

        span.innerHTML = `
            <img class="bottom" src="https://staticbrainz.org/MB/add-384fe8d.png">
            Add "remixer" credit
        `;
        recording.appendChild(span);

        span = document.createElement('span');
        span.setAttribute('data-rel', 'remix of');
        if (linkTypes['remix of']) {
            span.className = 'btn disabled';
        } else {
            span.className = 'btn';
            span.onclick = addCreditClickHandler;
            span.setAttribute('data-remix-of', matches[1]);
        }

        span.innerHTML = `
            <img class="bottom" src="https://staticbrainz.org/MB/add-384fe8d.png">
            Add "remix of" credit
        `;
        recording.appendChild(span);
    }
}

function addCreditClickHandler(event) {
    event.preventDefault();

    const recording = this.parentElement;
    const relType = this.getAttribute('data-rel');

    const addRel = recording.getElementsByClassName('add-rel')[0];
    addRel.click();

    if (relType === 'remixer') {
        const remixer = this.getAttribute('data-remixer');

        // wait 250ms for the dialog to be added to the DOM
        window.setTimeout(function () {
            const dialog = document.getElementById('dialog');
            const linkType = dialog.getElementsByClassName('link-type')[0];
            setElementValue(linkType, RemixerOptionValue, 'change');

            const name = dialog.getElementsByClassName('name')[0];
            if (remixer) {
                setElementValue(name, remixer);
            } else {
                name.focus();
            }
        }, 250);
    } else if (relType === 'remix of') {
        const remixOf = this.getAttribute('data-remix-of');

        // wait 250ms for the dialog to be added to the DOM
        window.setTimeout(function () {
            const dialog = document.getElementById('dialog');
            const entityType = dialog.getElementsByClassName('entity-type')[0];
            setElementValue(entityType, 'recording', 'change');

            // wait another 250ms for the link-type select options to be updated
            window.setTimeout(function () {
                const linkType = dialog.getElementsByClassName('link-type')[0];
                setElementValue(linkType, RemixOfOptionValue, 'change');

                const name = dialog.getElementsByClassName('name')[0];
                if (remixOf) {
                    setElementValue(name, remixOf);
                } else {
                    name.focus();
                }
            }, 250);
        }, 250);
    }
}

// wait 500ms for the page to fully initialise
window.addEventListener('load', function () {
    window.setTimeout(addLinksToRecordings, 500);
});
