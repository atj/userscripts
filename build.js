import { build } from '@kellnerd/musicbrainz-scripts/tools/build.js';

build({
    bookmarkletBasePath: false,
    userscriptBasePath: 'src/userscripts',
    docBasePath: 'doc',
    debug: process.argv.includes('-d'),
});
