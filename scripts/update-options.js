#!/usr/bin/env node

const fs = require("fs")

const run = async () => {
  await updateGoplsOptions()
  await updateClientOptions()
}

const updateClientOptions = async () => {
  const pkg = require("../package.json")
  const cocVersion = pkg.engines.coc.replace(/^\^/, '')

  const source = await get(
    `https://raw.githubusercontent.com/neoclide/coc.nvim/v${cocVersion}/data/schema.json`
  )

  const schema = JSON.parse(source)

  Object.assign(pkg.contributes.configuration.properties["go.disable"].properties, {
    features: Object.assign(schema.definitions.languageServerBase.properties.disabledFeatures, {
      description: "Disabled features (Change requires `:CocRestart`)"
    })
  })

  fs.writeFileSync("package.json", JSON.stringify(pkg, null, "  ") + "\n")

}

const updateGoplsOptions = async () => {

  const source = await get(
    "https://raw.githubusercontent.com/golang/tools/master/gopls/doc/settings.md"
  )

  const opts = []
  const lenses = []

  let section
  let m
  let item
  let lens

  source.split("\n").forEach((line) => {
    if (line.match(/^<!-- BEGIN/)) {
      section = line.replace(
        /<!-- BEGIN (.*): DO NOT MANUALLY EDIT THIS SECTION -->/,
        `$1`
      )
    }

    if (line.match(/^<!-- END/)) {
      section = ""
    }

    if (section === 'User') {
      if ((m = line.match(/^###+ \*\*(.*)\*\* \*(.*)\*$/))) {
        const [, Name, Type] = m
        item = { Name, Type, Doc: "", Default: null }
        opts.push(item)
      } else if ((m = line.match(/^Default: `(.*)`\.$/))) {
        const [, Default] = m
        item.Default = Default
        item.Doc = item.Doc.trim() + "\n"
        item = null
      } else if (item) {
        item.Doc = `${item.Doc || ""}\n${line}`
      }
    } else if (section === 'Lenses') {
      if ((m = line.match(/^### \*\*(.*)\*\*$/))) {
        const [, Title] = m
        lens = { Title, Doc: "" }
        lenses.push(lens)
      } else if ((m = line.match(/^Identifier: `(.*)`$/))) {
        const [, key] = m
        lens.Key = key
      } else if (lens?.Key) {
        lens.Doc += line
      }
    }
  })

  const pkg = require("../package.json")

  const data = {}

  let props = opts
    .sort(({ Name: a }, { Name: b }) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
    .reduce((props, { Name, Type, Doc, Default }) => {
      props[Name] = {
        ...parseType(Type, Doc),
        default: parseDefault(Default),
        description: Doc,
      }

      data[Name] = { Name, Type, Doc, Default }

      return props
    }, {})

  const { type, description } = props.analyses

  props.analyses = {
    type,
    description,
    additionalProperties: false,
    patternProperties: {
      "^S[AT]?\\d{4}$": {
        type: "boolean",
      },
    },
    properties: await getAnalysesProperties(),
  }

    const codeLenseDefault = JSON.parse(data.codelenses.Default)

    // Set default lenses
    Object.entries(codeLenseDefault).forEach(([key, value]) => {
      const lens = lenses.find((l) => l.Key === key)
      if (!lens) {
        lenses.push({ Key: key, Default: value })
      } else {
        lens.Default = value
      }
    })

    props.codelenses.additionalProperties = false
    props.codelenses.patternProperties = undefined
    props.codelenses.properties = lenses.sort((a, b) => a.Key.localeCompare(b.Key)).reduce(
      (props, { Key, Default, Doc }) => {
        return {...props, [Key]: { type: "boolean", default: Default, description: Doc?.trim() }}
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

const getAnalysesProperties = async () => {
  let k = ""
  let inside = false

  const content = await get(
    "https://raw.githubusercontent.com/golang/tools/master/gopls/doc/analyzers.md"
  )

  let props = content.split(/\n/).reduce((props, l) => {
    const m = l.match(/^<!-- ([A-Z]+) Analyzers/)
    inside = m !== null ? m[1] === "BEGIN" : inside
    if (!inside) {
      return props
    }

    if (l.match(/^## /)) {
      k = l.replace(/^## \*\*(.*)\*\*$/, "$1")
      props[k] = { type: "boolean", description: "" }
    } else if (l.match(/^\*\*Enabled by default\.\*\*/)) {
      props[k].default = true
    } else if (props[k] && l) {
      props[k].description += `${l}\n`
    }

    return props
  }, {})

  props = Object.keys(props).reduce(
    (p, k) => ({
      ...p,
      [k]: {
        ...props[k],
        description: props[k].description.trim(),
      },
    }),
    {}
  )

  return props
}

;(async () => {
  try {
    await run()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
