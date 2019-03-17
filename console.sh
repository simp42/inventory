#!/usr/bin/env bash

# Proxy for symfony's console command - run in container
docker-compose exec web /work/bin/console "$@"