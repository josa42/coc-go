#!/usr/bin/env node

const fs = require("fs")

async function run() {
  let contents = fs.readFileSync("src/utils/config.ts", "utf8").split("\n")

  let inside = false

  contents = contents.reduce((lines, line) => {
    let isGplsoptions = line.match(/^export interface GoplsOptions/)

    if (isGplsoptions) {
      inside = true
      return [...lines, ...generate()]
    }

    if (inside) {
      inside = line !== "}"
      return lines
    }

    return [...lines, line]
  }, [])

  fs.writeFileSync("src/utils/config.ts", contents.join("\n"))
}

function generate() {
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"))
  let lines = ["export interface GoplsOptions {"]

  const opts =
    pkg.contributes.configuration.properties["go.goplsOptions"].properties

  Object.keys(opts)
    .filter((k) => !opts[k].description.match(/EXPERIMENTAL/))
    .sort()
    .forEach((k) => {
      lines.push(
        "",
        `  /**`,
        `   * Default: ${getDefault(opts[k])}`,
        `   */`,
        `  ${k}: ${getType(opts[k])}`
      )
    })

  Object.keys(opts)
    .filter((k) => opts[k].description.match(/EXPERIMENTAL/))
    .sort()
    .forEach((k) => {
      lines.push(
        "",
        `  /**`,
        `   * Experimental!`,
        `   * Default: ${getDefault(opts[k])}`,
        `   */`,
        `  ${k}: ${getType(opts[k])}`
      )
    })

  lines.push("}")
  return lines
}

function getType(o) {
  switch (o.type) {
    case "array":
      return `${o.items.type}[]`

    case "object":
      const props = { ...(o.properties || {}), ...(o.patternProperties || {}) }
      return `{ string: ${Object.keys(props)
        .map((k) => props[k].type)
        .reduce((ts, t) => (ts.includes(t) ? ts : [...ts, t]), [])
        .join("|")} }`

    default:
      if (o.enum) {
        return `"${o.enum.join('" | "')}"`
      }
      return o.type
  }
}

function getDefault(o) {
  switch (o.type) {
    case "array":
      return o.default || "[]"

    case "object":
      return o.default || "{}"

    case "boolean":
      return o.default || "false"

    case "string":
      return `"${o.default || ""}"`
  }

  return o.default
}

run()
