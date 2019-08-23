#!/bin/bash

curl -sS https://raw.githubusercontent.com/microsoft/vscode-go/master/snippets/go.json \
  | jq '.[".source.go"]' \
  | gsed 's/\("body"\): \(".*"\)/\1: [\2]/' \
  | gsed 's/\([^\]\)\\n/\1","/g' \
  | gsed 's/"Snippet for /"/g' \
  | jq > snippets/go.json
