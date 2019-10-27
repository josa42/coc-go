#!/bin/bash

configTable() {
  printf "| Key %s | %s |\n" "$(printf ' %.0s' {1..36})" "$(printf ' %.0s' {1..200})"
  printf "|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|\n"

  for k in $(cat package.json | jq -r '.contributes.configuration.properties | keys[]'); do
    desc="$(cat package.json | jq -r '.contributes.configuration.properties["'$k'"].description' 2> /dev/null | grep -v null | sed 's/\[\(EXPERIMENTAL\)\]/**\1**/')"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    printf "| %-40s | %-200s |\n" "\`$k\`" "$desc"

    for sk in $(cat package.json | jq -r '.contributes.configuration.properties["'$k'"].properties | keys[]' 2> /dev/null); do
      desc="$(cat package.json | jq -r '.contributes.configuration.properties["'$k'"].properties["'$sk'"].description' 2> /dev/null | grep -v null | sed 's/\[\(EXPERIMENTAL\)\]/**\1**/')"
      printf "| ‣ %-38s | %-200s |\n" "\`$sk\`" "$desc"
    done
  done
  echo ""
}

commandsTable() {
  printf "| Key %s | %s |\n" "$(printf ' %.0s' {1..36})" "$(printf ' %.0s' {1..200})"
  printf "|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|\n"

  for k in $(cat package.json | jq -r '.contributes.commands[].command'); do
    desc="$(cat package.json | jq -r '.contributes.commands[] | select(.command == "'$k'") | .title' 2> /dev/null | grep -v null)"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    printf "| %-40s | %-200s |\n" "\`$k\`" "$desc"
  done
  echo ""
}

configTable
commandsTable

