#!/bin/bash

set -e

./scripts/update-commands.js
./scripts/update-options.js
./scripts/update-options-interface.js
./scripts/update-snippets.js
./scripts/update-tables.sh

