#!/bin/bash

set -e

./scripts/update-commands.js
./scripts/update-options.sh
./scripts/update-options-interface.js
./scripts/update-snippets.js
./scripts/update-tables.sh

