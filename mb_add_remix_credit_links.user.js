// ==UserScript==
// @name        MusicBrainz: Semi-automate adding "remixer" and "remix of" credits
// @version     2024.02.12.1
// @description Adds links to the relationship editor that semi-automate adding "remixer" and "remix-of" credits
// @author      atj
// @license     MIT; https://opensource.org/licenses/MIT
// @namespace   https://github.com/atj/userscripts
// @downloadURL https://raw.github.com/atj/userscripts/master/mb_add_remix_credit_links.user.js
// @updateURL   https://raw.github.com/atj/userscripts/master/mb_add_remix_credit_links.user.js
// @match       *://*.musicbrainz.org/release/*/edit-relationships
// @grant       none
// @run-at      document-idle
// ==/UserScript==

/* Examples of track titles that this regex should match:
 *
 * Nepalese Bliss (Jimpster mix)
 * Earth Is the Place (FK edit)
 * Right by Your Side (Restless Soul Aquarius mix)
 * Animal (DJ Martin & DJ Homes' Primordial Jungle mix)
 * Hotline Riddim (Jacques Renault edit)
 * Master Boogie Song & Dance - Roll the Joint (Joey Negro re-edit)
 * I Got It (Kenny Dope edit)
 * Manzel - It's Over Now (MAW remix dub)
 * Open Your Eyes (New Phunk Theory's Little Green dub)
 * Black Truffles in the Snow (Mike Huckaby's S Y N T H remix)
 * Yes, No, Maybe (Sterac Electronics instrumental remix)
 * The Rainbow Song (Crackazat rework)
 * I Am Ice (Carbinax remodel)
 * Tears (ReKaB re‐shuffle)
 */
const TitleRemixRegexp =
    /^\s*(.+)\s+\(\s*(.+)\s+(?:(?:re-?)?(?:[dr]ub|edit|mix)|re-?(?:model|shuffle|work)).*\)/i;

/* Examples of track titles this regex should match:
 *
 * Iceolate (12″ extended mix)
 * Zone 12 (extended mix)
 * Punks in the City (disco edit)
 * Individualists (7inch version)
 * Wicked Games (radio edit)
 * Respectness (dub version)
 * Barcelona (extended version)
 * Flux (extended 12″ mix)
 * Strobe (club edit)
 */
const TitleEditRegexp =
    /^\s*(.+)\s+\(\s*(?:club|extended|disco|dub|radio)?\s*(?:(?:7|10|12)\s*(?:['"″)]|inch)?)?\s*(?:club|extended|disco|dub|radio)?\s*(?:edit|mix|version)\s*\)/i;

// This code is based on:
// https://stackoverflow.com/questions/42795059/programmatically-fill-reactjs-form
function setElementValue(element, value, event = 'input') {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
        element,
        'value'
    );
    const valueSetter =
        propertyDescriptor === undefined ? null : propertyDescriptor.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
        prototype,
        'value'
    ).set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }

    element.dispatchEvent(new Event(event, { bubbles: true }));
}

function tabToConfirmFirstOption(element) {
    const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        keyCode: 9,
        which: 9,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
}

function addRemixCreditLinks() {
    const recordings = document.querySelectorAll('td.recording');
    const releaseArtists = Array.from(
        document.querySelectorAll('p.subheader > a[href^="/artist"] bdi')
    ).map(bdi => bdi.innerText);

    for (const recording of recordings) {
        const title = recording.querySelector('bdi').innerText;
        const remixMatches = TitleRemixRegexp.exec(title);
        const editMatches = TitleEditRegexp.exec(title);
        if (!remixMatches && !editMatches) {
            continue;
        }

        let linkTypes = {};
        // find existing relationship types for this recording
        for (const link of recording.getElementsByClassName('link-phrase')) {
            linkTypes[link.innerText] = 1;
        }

        let trackArtists = Array.from(
            recording.querySelectorAll('td > a[href^="/artist"] bdi')
        ).map(bdi => bdi.innerText);
        if (!trackArtists.length) {
            trackArtists = releaseArtists;
        }

        let button = document.createElement('button');
        if (!remixMatches || linkTypes['remixer:']) {
            button.className = 'add-item with-label btn disabled';
        } else if (remixMatches) {
            button.className = 'add-item with-label';
            button.onclick = addRemixCreditClickHandler;
            button.setAttribute('data-remixer', remixMatches[2]);
        }

        button.innerHTML = `
            Add "remixer" credit
        `;
        recording.appendChild(button);
        recording.appendChild(document.createTextNode('\n'));

        button = document.createElement('button');
        if (!remixMatches || linkTypes['remix of:']) {
            button.className = 'add-item with-label btn disabled';
        } else if (remixMatches) {
            // recording search will be pre-filled with title and artists to improve the results
            const recordingQuery = `${remixMatches[1]} ${trackArtists.join(
                ' '
            )}`;

            button.className = 'add-item with-label';
            button.onclick = addRemixCreditClickHandler;
            button.setAttribute('data-remix-of', recordingQuery);
        }

        button.innerHTML = `
            Add "remix of" credit
        `;
        recording.appendChild(button);

        button = document.createElement('button');
        if (!editMatches || linkTypes['edit of:']) {
            button.className = 'add-item with-label btn disabled';
        } else if (editMatches) {
            // recording search will be pre-filled with title and artists to improve the results
            const recordingQuery = `${editMatches[1]} ${trackArtists.join(
                ' '
            )}`;

            button.className = 'add-item with-label';
            button.onclick = addRemixCreditClickHandler;
            button.setAttribute('data-edit-of', recordingQuery);
        }

        button.innerHTML = `
            Add "edit of" credit
        `;
        recording.appendChild(button);
    }
}

function addRemixCreditClickHandler(event) {
    event.preventDefault();

    const recording = this.parentElement;
    const remixer = this.getAttribute('data-remixer');
    const remixOf = this.getAttribute('data-remix-of');
    const editOf = this.getAttribute('data-edit-of');

    const addRel = recording.querySelector('button.add-relationship');
    addRel.click();

    if (remixer) {
        // wait 250ms for the dialog to be added to the DOM
        window.setTimeout(function () {
            const dialog = document.getElementById('add-relationship-dialog');
            const entityType = dialog.querySelector('select.entity-type');
            setElementValue(entityType, 'artist', 'change');

            const linkType = dialog.querySelector('input.relationship-type');
            setElementValue(linkType, 'remixed / remixer');
            tabToConfirmFirstOption(linkType);

            const name = dialog.querySelector('input.relationship-target');
            setElementValue(name, remixer);
            const search = name.parentElement.querySelector('button.search');
            if (search) {
                window.setTimeout(() => {
                    search.click();
                    name.focus();
                }, 100);
            }
        }, 250);
    } else if (remixOf || editOf) {
        // wait 250ms for the dialog to be added to the DOM
        window.setTimeout(function () {
            const dialog = document.getElementById('add-relationship-dialog');
            const entityType = dialog.querySelector('select.entity-type');
            setElementValue(entityType, 'recording', 'change');

            // wait another 250ms for the link-type select options to be updated
            window.setTimeout(() => {
                const linkType = dialog.querySelector(
                    'input.relationship-type'
                );
                setElementValue(
                    linkType,
                    remixOf ? 'remix of / has remixes' : 'edit of / edits'
                );
                tabToConfirmFirstOption(linkType);

                const name = dialog.querySelector('input.relationship-target');
                setElementValue(name, remixOf || editOf);
                const search =
                    name.parentElement.querySelector('button.search');
                if (search) {
                    window.setTimeout(() => {
                        search.click();
                        name.focus();
                    }, 100);
                }
            }, 250);
        }, 250);
    }
}

// wait 500ms for the page to fully initialise
const intervalId = window.setInterval(() => {
    if (!document.querySelector('.loading-message')) {
        window.clearInterval(intervalId);
        addRemixCreditLinks();
    }
}, 500);
