# TCL Cassette player maintenance

The eight published topic routes, MP4 names, original videos, preview images and product appearance are retained. The player uses the 360 Round Cassette playback and cache baseline, adapted to this product. The service worker and caches are isolated to this product's path.

After replacing a video or changing the player, worker template, CSS or pages in a complete checkout, run `python3 build_player.py`. It reads the original MP4 files to calculate their Git blob identifiers and sizes, updates the page catalogs and generates `sw.js`. It does not modify MP4 files. Commit the generated pages and `sw.js` with the source changes. For the historical preview build only, `remote-tree.json` records the GitHub tree metadata used when the original media was unavailable locally; do not use it after media changes.

The worker validates complete responses against the original Git blob identifier before caching, and serves ranges from verified files. It keeps up to four videos and 24 MiB; browser storage is best effort. Original covers remain in place. Actual playback should be checked on phones, including WeChat, after deployment.

Run `node --test tests/*.test.cjs` and `python3 -m unittest discover -s tests -p 'test_*.py'` before release.
