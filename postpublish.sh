#!/usr/bin/env sh

cp dist/package.json .
npm i --package-lock-only
git commit -a -m "chore(release): Update package*.json [skip ci]"
git push -o ci.skip
