#!/usr/bin/env bash

# Proxy for backend's composer command - run in container
docker-compose exec web composer "$@"