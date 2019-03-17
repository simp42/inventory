#!/usr/bin/env bash
docker run --rm -it -v "$(pwd):/src" -p 8081:3000 node /bin/bash
# yarn build oder yarn start