#!/usr/bin/env bash

cd /src

# Install yarn packages if node-modules
if [[ ! -d "node_modules" ]]; then
  echo "Node modules doesn't exist, install packages"
  yarn install
fi

yarn start