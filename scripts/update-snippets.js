#!/usr/bin/env node

const https = require('https')
const fs = require('fs')

const run = async () => {
  const resp = await request('https://raw.githubusercontent.com/golang/vscode-go/master/snippets/go.json')
  const snippets = map(resp['.source.go'], ({ prefix, body, description }) => ({
    prefix,
    body: body.split(/\n/),
    description: description.replace(/^Snippet for /, '')
  }))

  fs.writeFile("snippets/go.json", JSON.stringify(snippets, null, '  '), 'utf8', (err) => !err || console.log(err))
}

const request = (url) => new Promise((resolve, reject) => {
  https
    .get(url, (resp) => {
      let data = ''
      resp.on('data', (chunk) => data += chunk)
      resp.on('end', () => resolve(JSON.parse(data)))
    })
    .on("error", (err) => reject(err))
})

const map = (snippets, fn) => {
  Object.keys(snippets).forEach((key) => snippets[key] = fn(snippets[key]))
  return snippets
}

run()

