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
    | tr '\n' ' ' \
    | grep -v null \
    | sed 's/\[\(EXPERIMENTAL\)\]/**\1**/' \
    | sed 's/See \(.*\): \(https.*\)/See [\1](\2)/' \
    | sed 's/\. .*$/./'
}

defaultVal() {
  q=".contributes.configuration"
  for k in $*; do
    q="${q}.properties[\"${k}\"]"
  done
  q="${q}.default"

  query "${q}" 2> /dev/null | grep -v null
}


max() {
  if [[ $1 -gt $2 ]]; then
    echo $1
  else
    echo $2
  fi
}

head() {
  l2=$(($2 - 12))
  if [[ "$3" = "" ]]; then
    printf "| Key %-$(($1 - 4))s | Description %s |\n" "" "$(printf -- ' %.0s' $(seq $l2))"
    printf "|-%s-|-%s-|\n" "$(printf -- '-%.0s' $(seq $1))" "$(printf -- '-%.0s' $(seq $2))"
  else
    l3=$(($3 - 8))
    printf "| Key %-$(($1 - 4))s | Description %s | Default %s |\n" "" "$(printf -- ' %.0s' $(seq $l2))" "$(printf -- ' %.0s' $(seq $l3))"
    printf "|-%s-|-%s-|-%s-|\n" "$(printf -- '-%.0s' $(seq $1))" "$(printf -- '-%.0s' $(seq $2))" "$(printf -- '-%.0s' $(seq $3))"
  fi
}

optionsTable() {
  kl=0
  vl=0
  dl=0
  for k in $(query '.contributes.configuration.properties | keys[]' | sort); do
    desc="$(desc "$k")"
    def="$(defaultVal "$k")"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    kl=$(max $((${#k} + 6)) $kl)
    vl=$(max ${#desc} $vl)
    dl=$(max ${#def} $dl)

    for sk in $(query '.contributes.configuration.properties["'$k'"].properties | keys[]' | sort); do
      desc="$(desc "$k" "$sk")"
      def="$(defaultVal "$k" "$sk")"
      kl=$(max $((${#sk} + 4)) $kl)
      vl=$(max ${#desc} $vl)
      dl=$(max ${#def} $dl)
    done
  done

  head $kl $vl $dl

  for k in $(query '.contributes.configuration.properties | keys[]' | sort); do
    desc="$(desc "$k")"
    def="$(defaultVal "$k")"
    if [[ "$desc" = *"DEPRECATED"* ]]; then
      continue
    fi

    printf "| %-${kl}s | %-${vl}s | %-${dl}s |\n" "**\`$k\`**" "$desc" "$def"

    for sk in $(query '.contributes.configuration.properties["'$k'"].properties | keys[]' | sort); do
      desc="$(desc "$k" "$sk")"
      def="$(defaultVal "$k" "$sk")"
      printf "| ‣ %-$(($kl - 2))s | %-${vl}s | %-${dl}s |\n" "\`$sk\`" "$desc" "$def"
    done
  done
}

commandsTable() {
  kl=0
  vl=0
  for k in $(query '.contributes.commands[].command' | sort); do
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

