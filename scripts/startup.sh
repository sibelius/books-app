#! /usr/bin/env bash
set -ex

yarn --force

cd ./packages
cp server/.env.local server/.env
cd ..

yarn update