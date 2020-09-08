#!/usr/bin/env node

const fs = require("fs")

const CMD_LINE_EXPR = /^\s*"(go\..+)",$/

async function run() {
  const contents = fs.readFileSync("src/extension.ts", "utf8").split("\n")
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

  const commandKeys = contents
    .reduce((keys, l) => {
      if (l.match(CMD_LINE_EXPR)) {
        return [...keys, l.match(CMD_LINE_EXPR)[1]]
      }
      return keys
    }, [])
    .sort((a, b) => a.localeCompare(b))

  pkg.contributes.commands = commandKeys
    .map(key => {
      return (
        pkg.contributes.commands.find(({ command }) => command === key) || {
          title: key
            .replace(/^go\./, "")
            .replace(/\./g, " ")
            .replace(/^(\w+) (clear)/, "Remove all $1")
            .replace(/^(\w+) (generate|add|remove|toggle)/, "$2 $1")
            .replace(/ (file|line)$/, " in current $1")
            .replace(/^(install)/, "$1 / update")
            .replace(/^./, s => s.toUpperCase()),
          category: "Go",
          command: key
        }
      )
    })
    .filter(({ command }) => commandKeys.some(key => key === command))

  pkg.activationEvents = [
    "onLanguage:go",
    "onLanguage:gomod",
    ...commandKeys
      .filter(key => key.match(/^go\.(install\..+|version)$/))
      .map(key => `onCommand:${key}`)
  ]

  fs.writeFileSync("package.json", JSON.stringify(pkg, "", "  ") + "\n")
}

run()
