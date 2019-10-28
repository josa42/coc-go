#!/bin/bash

for o in $(curl -sS 'https://raw.githubusercontent.com/golang/tools/master/gopls/doc/settings.md' | grep '^\(### \*\*\)' | sed 's/^### \*\*//' | sed 's/\*\*.*//'); do
  echo $o

  if [[ "$(cat package.json | jq '.contributes.configuration.properties["go.goplsOptions"].properties["'$o'"]')" = "null" ]]; then
    cat package.json | jq '.contributes.configuration.properties["go.goplsOptions"].properties["'$o'"] = { "type": "", "description": "" }' > package.tmp.json
    mv package{.tmp,}.json
  fi
done
