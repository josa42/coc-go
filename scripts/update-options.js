#!/usr/bin/env node

const fs = require("fs")

const run = async () => {
  const source = await get(
    "https://raw.githubusercontent.com/golang/tools/master/gopls/doc/settings.md"
  )

  const opts = {}

  let section
  let m
  let item

  source.split("\n").forEach((line) => {
    if (line.match(/^<!-- BEGIN/)) {
      section = line.replace(
        /<!-- BEGIN (.*): DO NOT MANUALLY EDIT THIS SECTION -->/,
        `$1`
      )
      opts[section] = []
    }

    if (section) {
      if ((m = line.match(/^### \*\*(.*)\*\* \*(.*)\*$/))) {
        const [, Name, Type] = m
        item = { Name, Type, Doc: "", Default: null }
        opts[section].push(item)
      } else if ((m = line.match(/^Default: `(.*)`\.$/))) {
        const [, Default] = m
        item.Default = Default
        item.Doc = item.Doc.trim() + "\n"
        item = null
      } else if (item) {
        item.Doc = `${item.Doc || ""}\n${line}`
      }
    }

    if (line.match(/^<!-- END/)) {
      section = ""
    }
  })

  const pkg = require("../package.json")

  const data = {}

  let props = {}
  ;["User", "Experimental"].forEach((k) => {
    props = opts[k]
      .sort(({ Name: a }, { Name: b }) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      )
      .reduce((props, { Name, Type, Doc, Default }) => {
        props[Name] = {
          ...parseType(Type, Doc),
          default: parseDefault(Default),
          description: parseDescription(Doc, k),
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

  const codeLenseDefault = JSON.parse(data.codelenses.Default)

  props.codelenses.additionalProperties = false
  props.codelenses.patternProperties = undefined
  props.codelenses.properties = Object.keys(codeLenseDefault).reduce(
    (props, key) => {
      props[key] = { type: "boolean", default: codeLenseDefault[key] }
      return props
    },
    {}
  )

  pkg.contributes.configuration.properties["go.goplsOptions"].properties = props

  fs.writeFileSync("package.json", JSON.stringify(pkg, null, "  ") + "\n")
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
            type: "boolean",
          },
        },
      }
    case "map[string]string":
      return {
        type: "object",
        patternProperties: {
          ".+": {
            type: "string",
          },
        },
      }
    case "enum":
      return {
        type: "string",
        enum: parseEnum(doc),
      }
    case "time.Duration":
      return {
        type: "string",
      }
  }
}

const parseEnum = (str) => {
  return str
    .split(/\n/)
    .filter((l) => l.match(/^ *\* `".*"`.*$/))
    .map((l) => l.replace(/^ *\* `"(.*)"`.*$/, "$1"))
}

const parseDefault = (str) => {
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

const get = async (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = ""

        resp.on("data", (chunk) => (data += chunk))
        resp.on("end", () => resolve(data))
      })
      .on("error", (err) => reject(err))
  })

;(async () => {
  try {
    await run()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
