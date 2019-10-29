#!/bin/bash

query() {
  cat package.json | jq -r "$1" 2> /dev/null | grep -v null
}

desc() {
  q=".contributes.configuration"
  for k in $*; do
    q="${q}.properties[\"${k}\"]"
  done
  q="${q}.description"

  query "${q}" 2> /dev/null \
    | grep -v null \
    | sed 's/\[\(EXPERIMENTAL\)\]/**\1**/' \
    | sed 's/See \(.*\): \(https.*\)/See [\1](\2)/'
}

max() {
  if [[ $1 -gt $2 ]]; then
    echo $1
  else
    echo $2
  fi
}

head() {
  printf "| Key %-$(($1 - 4))s | %s |\n" "" "$(printf -- ' %.0s' $(seq $2))"
  printf "|-%s-|-%s-|\n" "$(printf -- '-%.0s' $(seq $1))" "$(printf -- '-%.0s' $(seq $2))"
}

optionsTable() {
  kl=0
  vl=0
  for k in $(query '.contributes.configuration.properties | keys[]'); do
    desc="$(desc "$k")"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    kl=$(max $((${#k} + 6)) $kl)
    vl=$(max ${#desc} $vl)

    for sk in $(query '.contributes.configuration.properties["'$k'"].properties | keys[]'); do
      desc="$(desc "$k" "$sk")"
      kl=$(max $((${#sk} + 4)) $kl)
      vl=$(max ${#desc} $vl)
    done
  done

  head $kl $vl

  for k in $(query '.contributes.configuration.properties | keys[]'); do
    desc="$(desc "$k")"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    printf "| %-${kl}s | %-${vl}s |\n" "**\`$k\`**" "$desc"

    for sk in $(query '.contributes.configuration.properties["'$k'"].properties | keys[]'); do
      desc="$(desc "$k" "$sk")"
      printf "| ‣ %-$(($kl - 2))s | %-${vl}s |\n" "\`$sk\`" "$desc"
    done
  done
}

commandsTable() {
  kl=0
  vl=0
  for k in $(query '.contributes.commands[].command'); do
    desc="$(query '.contributes.commands[] | select(.command == "'$k'") | .title')"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    kl=$(max $((${#k} + 6)) $kl)
    vl=$(max ${#desc} $vl)
  done

  head $kl $vl

  for k in $(query '.contributes.commands[].command'); do
    desc="$(query '.contributes.commands[] | select(.command == "'$k'") | .title')"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    printf "| %-${kl}s | %-${vl}s |\n" "**\`$k\`**" "$desc"
  done
}

run() {
  table=''
  while IFS= read -r l; do
    case $l in
      '## Commands')              table='commands' ;;
      '## Configuration options') table='options'  ;;
    esac

    if [[ "$(echo $l | grep '^|')" != "" ]]; then
      case $table in
        commands) commandsTable ;;
        options)  optionsTable  ;;
      esac
      table=''
    else
      echo "$l"
    fi
  done < README.md
}

run > README.tmp.md
mv README{.tmp,}.md

