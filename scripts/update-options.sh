#!/bin/bash

run() {
  updateOptions
  updateAnalysis
  updateCodelenses
  updateAnnotations
}

updateOptions() {
  local experPre=""
  local option=""
  local is_enum=0

  local ignoreEnums=(
    "hoverKind##SingleLine"
    "hoverKind##Structured"
  )

  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties={}'

  IFS=$'\n'; for l in $(curl -sS 'https://raw.githubusercontent.com/golang/tools/master/gopls/doc/settings.md'); do

    if [[ "$l" =~ '## Experimental' ]]; then
      experPre='[EXPERIMENTAL] '

    elif [[ "$l" =~ '## Officially supported' ]]; then
      experPre=''

    elif [[ "$l" =~ '###' ]]; then
      o="$(echo $l | sed 's/^### \*\*//' | sed 's/\*\*.*//')"
      t=$(echo $l | sed 's/^### \*\*[^\*]*\*\* \*\([^\*]*\)\*/\1/' | sed 's/^.* \(string\)$/\1/')


      local type=""$(parseType $t)""

      if [[ "$(cat package.json | jq '.contributes.configuration.properties["go.goplsOptions"].properties["'$o'"]')" = "null" ]]; then
        jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties["'$o'"] = { }'
      fi

      setOptionPropString "$o" "description" "${experPre}$(getOptionsDescription $o)"
      setOptionPropString "$o" "type" "$type"

      itemType="$(parseItemType $t)"
      if [[ "$itemType" != "" ]] && [[ "$type" == "array" ]]; then
        setOptionProp "$o" "items" '{ "type": "'$itemType'" }'

      elif [[ "$itemType" != "" ]] && [[ "$type" == "object" ]]; then
        setOptionProp "$o" "patternProperties" '{ ".+": { "type": "'$itemType'" } }'

      else
        delOptionProp "$o" "items"
      fi

      delOptionProp "$o" "enum"

      option="$o"
      desc_done=0
      is_enum=0

      echo "[$option]"


    elif [[ "$option" != "" ]]; then

      # set default
      if [[ "$l" =~ 'Default:' ]] || [[ "$l" =~ 'Default value:' ]]; then
        setOptionProp "$o" "default" "$(echo $l | sed 's/^Default:  *//' | sed 's/^Default value:  *//' | sed 's/\.$//'| sed 's/^`\(.*\)`$/\1/')"


      elif [[ "$l" == *"be one of:" ]]; then
        is_enum=1

      elif [[ "$(echo $l | grep '^\*')" != '' ]]; then
        if [[ $is_enum -eq 1 ]]; then
          local item="$(echo $l | sed 's/[\*`" ]*//g')"
          if ! [[ " ${ignoreEnums[@]} " =~ " ${option}##${item} " ]]; then
            appendOptionProp "$option" 'enum' "$item"
          fi
        fi

      # Find description end
      elif [[ "$(echo $l | grep '^```')" != '' ]] || [[ "$(echo $l | grep "Example Usage")" != '' ]]; then
        desc_done=1

      # Set description
      elif [[ $desc_done -eq 0 ]] && [[ "$l" != '' ]]; then
        desc_start=$(getOptionsDescription "$option")

        if [[ "$desc_start" != "" ]]; then
          desc="${desc_start} ${l}"

        else
          desc="${l}"
        fi

        if [[ "$(echo $desc | grep '\.')" != '' ]]; then
          desc=$(echo $desc | sed 's/\..*/./')
          desc_done=1
        fi

        setOptionPropString "$option" "description" "${experPre}${desc}"
        echo "=> ${experPre}${desc}"


      fi

      sortOptionProps "$option"
    fi
  done
}

updateAnalysis() {
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.analyses.type="object"'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.analyses.additionalProperties=false'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.analyses.properties={}'
  jqUpdate 'del(.contributes.configuration.properties["go.goplsOptions"].properties.analyses.patternProperties)'

  IFS=$'\n'; for l in $(curl -sS 'https://raw.githubusercontent.com/golang/tools/master/gopls/doc/analyzers.md'); do

    if [[ "$l" == '### '* ]]; then
      o="$(echo $l | sed 's/^### \*\*//' | sed 's/\*\*.*//')"
      jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.analyses.properties["'$o'"] = { "type": "boolean" }'


    elif [[ "$o" != "" ]]; then
      if [[ "$l" =~ 'Default:' ]] || [[ "$l" =~ 'Default value:' ]]; then
        jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.analyses.properties["'$o'"].default = '"$(echo $l | sed 's/^Default: `\(.*\)`\./\1/' | sed 's/^Default value: `\(.*\)`\./\1/')"

      fi
    fi
  done
}

updateCodelenses() {
  # jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.description="[EXPERIMENTAL]"'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.type="object"'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.additionalProperties=false'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.properties={}'
  jqUpdate 'del(.contributes.configuration.properties["go.goplsOptions"].properties.codelens.patternProperties)'

  declare -a options=("generate:true" "upgrade.dependency:true" "test:false" "gc_details:false")

  for e in ${options[@]}; do
    k="$(echo $e | sed 's/:.*//')"
    v="$(echo $e | sed 's/.*://')"
    jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.properties["'$k'"].type="boolean"'
    jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.codelens.properties["'$k'"].default='$v
  done
}

updateAnnotations() {
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.description="[EXPERIMENTAL]"'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.type="object"'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.additionalProperties=false'
  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.properties={}'
  jqUpdate 'del(.contributes.configuration.properties["go.goplsOptions"].properties.annotations.patternProperties)'

  declare -a options=("noBounds:false" "noEscape:false" "noInline:false" "noNilcheck:false")

  for e in ${options[@]}; do
    k="$(echo $e | sed 's/:.*//')"
    v="$(echo $e | sed 's/.*://')"
    jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.properties["'$k'"].type="boolean"'
    jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties.annotations.properties["'$k'"].default='$v
  done
}

getOptionPropString() {
  local key="$1"
  local prop="$2"

  jqRun '.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"]["'$prop'"]' -rc | grep -v '^null$'
}

getOptionProp() {
  local key="$1"
  local prop="$2"

  jqRun '.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"]["'$prop'"]' -c | grep -v '^null$'
}


getOptionsDescription() {
  echo $(getOptionPropString "$1" "description" | sed 's/^\[EXPERIMENTAL\] //')
}

setOptionPropString() {
  setOptionProp "$1" "$2" '"'$3'"'
}

setOptionProp() {
  local key="$1"
  local prop="$2"
  local value="$3"

  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"]["'$prop'"] = '$value''
}

appendOptionProp() {
  local key="$1"
  local prop="$2"
  local value="$3"

  if [[ "$(getOptionProp "$key" "$prop")" == "" ]]; then
    setOptionProp "$key" "$prop" '[]'
  fi

  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"]["'$prop'"] |= . + ["'$value'"]'


}

sortOptionProps() {
  local key="$1"

  local desc="$(getOptionPropString "$key" "description")"
  local type="$(getOptionPropString "$key" "type")"
  local default="$(getOptionProp "$key" "default")"
  local items="$(getOptionProp "$key" "items")"
  local patternProperties="$(getOptionProp "$key" "patternProperties")"
  local properties="$(getOptionProp "$key" "properties")"
  local enum="$(getOptionProp "$key" "enum")"

  jqUpdate '.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"] = {}'

  [[ "$type" != "" ]]              && setOptionPropString "$key" 'type' "$type"
  [[ "$default" != "" ]]           && setOptionProp       "$key" 'default' "$default"
  [[ "$items" != "" ]]             && setOptionProp       "$key" 'items' "$items"
  [[ "$patternProperties" != "" ]] && \
  [[ "$properties" = "" ]]         && setOptionProp       "$key" 'patternProperties' "$patternProperties"
  [[ "$properties" != "" ]]        && setOptionProp       "$key" 'properties' "$properties"
  [[ "$enum" != "" ]]              && setOptionProp       "$key" 'enum' "$enum"
  [[ "$desc" != "" ]]              && setOptionPropString "$key" 'description' "$desc"
}

delOptionProp() {
  local key="$1"
  local prop="$2"

  # echo "'$prop' = '$value'"

  jqUpdate 'del(.contributes.configuration.properties["go.goplsOptions"].properties["'$key'"]["'$prop'"])'
}

jqRun() {
  local query="$1"; shift
  cat package.json | jq "$query" $@
}

jqUpdate() {
  jqRun $@ > package.tmp.json
  mv package{.tmp,}.json
}

parseType() {
  local str=$1
  case $str in
    string|boolean)   echo $str ;;
    'array of strings') echo 'array' ;;
    'map of string to value') echo "object" ;;
    'map[string]bool') echo 'object' ;;
  esac
}

parseItemType() {
  local str=$1
  case $str in
    'map of string to value') echo 'string' ;;
    'array of strings') echo 'string' ;;
    "map[string]bool") echo 'bool' ;;
  esac
}


run
