#!/usr/bin/env node

const fs = require("fs")
const run = async () => {
  const opts = JSON.parse(
    JSON.parse(
      (
        await get(
          "https://raw.githubusercontent.com/golang/tools/master/internal/lsp/source/options_json.go"
        )
      )
        .split(/\n/)
        .filter(l => l.includes("OptionsJson"))
        .join("")
        .replace(/^const OptionsJson = /, "")
    )
  )

  const pkg = require("../package.json")

  const data = {}

  let props = {}
  ;["User", "Experimental"].forEach(k => {
    props = opts[k].reduce((props, { Name, Type, Doc, Default }) => {
      props[Name] = {
        ...parseType(Type, Doc),
        default: parseDefault(Default),
        description: parseDescription(Doc, k)
      }

      data[Name] = { Name, Type, Doc, Default }

      return props
    }, props)
  })

  let k = ""

  props.analyses.additionalProperties = false
  props.analyses.patternProperties = undefined
  props.analyses.properties = (
    await get(
      "https://raw.githubusercontent.com/golang/tools/master/gopls/doc/analyzers.md"
    )
  )
    .split(/\n/)
    .reduce((props, l) => {
      if (l.match(/^### /)) {
        k = l.replace(/^### \*\*(.*)\*\*$/, "$1")
        props[k] = { type: "boolean" }
      }

      if (l.match(/^Default value: /)) {
        props[k].default =
          l.replace(/^Default value: `(true|false)`\.$/, "$1") === "true"
      }
      return props
    }, {})

  const codeLenseDefault = JSON.parse(data.codelens.Default)

  props.codelens.additionalProperties = false
  props.codelens.patternProperties = undefined
  props.codelens.properties = Object.keys(codeLenseDefault).reduce(
    (props, key) => {
      props[key] = { type: "boolean", default: codeLenseDefault[key] }
      return props
    },
    {}
  )

  pkg.contributes.configuration.properties["go.goplsOptions"].properties = props

  fs.writeFileSync("package.json", JSON.stringify(pkg, null, "  "))
}

const parseType = (str, doc) => {
  switch (str) {
    default:
      return { type: str }
    case "bool":
      return { type: "boolean" }
    case "[]string":
      return { type: "array", items: { type: "string" } }
    case "map[string]bool":
      return {
        type: "object",
        patternProperties: {
          ".+": {
            type: "string"
          }
        }
      }
    case "golang.org/x/tools/internal/lsp/source.HoverKind":
    case "golang.org/x/tools/internal/lsp/source.Matcher":
    case "golang.org/x/tools/internal/lsp/source.ImportShortcut":
    case "golang.org/x/tools/internal/lsp/source.SymbolMatcher":
    case "golang.org/x/tools/internal/lsp/source.SymbolStyle":
      return {
        type: "string",
        enum: parseEnum(doc)
      }
  }
}

const parseEnum = str => {
  return str
    .split(/\n/)
    .filter(l => l.match(/^\* `".*"`$/))
    .map(l => l.replace(/^\* `"(.*)"`$/, "$1"))
}

const parseDefault = str => {
  if (str.match(/^".*"$/)) {
    return str.replace(/^"/, "").replace(/"$/, "")
  }

  if (str.match(/^(false|true)$/)) {
    return str === "true"
  }

  if (str === "null") {
    return null
  }

  return undefined
}

const parseDescription = (doc, key) =>
  key === "Experimental" ? `[EXPERIMENTAL] ${doc}` : doc

const https = require("https")

const get = async url =>
  new Promise((resolve, reject) => {
    https
      .get(url, resp => {
        let data = ""

        resp.on("data", chunk => (data += chunk))
        resp.on("end", () => resolve(data))
      })
      .on("error", err => reject(err))
  })

run()
