/**
 * Extracts the entity type and ID from a Deezer URL.
 * @param {string} url URL of a Deezer entity page.
 * @returns {[Deezer.EntityType,string]|undefined} Type and ID.
 */
export function extractEntityFromURL(url) {
    return url.match(/(album|artist)\/(\d+)/)?.slice(1);
}
