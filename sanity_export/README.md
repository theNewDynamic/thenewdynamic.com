
## 1. Search and replace:
`https://www.thenewdynamic.com` > The current site's live domain (ex: https://www.mywebsite.com). This will be used to fetch the live asset files.
`zenoy9xc` > Sanity project ID (ex: sxxx2w)

## 2. NPM Sripts:

Add this at your root's package.json's scripts object:

```
"gen:build": "hugo -s sanity_export --cleanDestinationDir --quiet -F",
"gen": "hugo --quiet -F -D -s sanity_export --cleanDestinationDir && node sanity_export/cms/pt && cat sanity_export/public/index.json | json2nd > ./sanit_export.ndjson",
"export:test": "node sanity_export/cms/migration/test",
"export": "cd sanity_export/cms && sanity dataset import ../../sanit_export.ndjson production --allow-failing-assets --replace",
"export:missing": "cd sanity_export/cms && sanity dataset import ../../sanit_export.ndjson production --allow-failing-assets --missings",
```

## 3. NPM Install.

cd into `sanity_export/cms` and `npm install`

Since you're in there do `sanity debug` to make sure the project is connected to the right sanity project and dataset.