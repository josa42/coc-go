const path = require('path')
const os = require('os')
const fs = require('fs')
const { spawn } = require('child_process')

const home = os.homedir()
const extensionsPath = path.join(home, '.config', 'coc', 'extensions')
const pkgPath = path.join(extensionsPath, 'package.json')

const main = async (action) => {
  switch(action) {
    case 'add': return await add()
    case 'remove': return await remove()
    default:
      console.error('Usage: link (add|remove)')
  }
}

const remove = async () => {
  await run('.', 'yarn','unlink')
  await run(extensionsPath, 'yarn','unlink', 'coc-go')

  const pkg = await readJSON(pkgPath)
  delete pkg.dependencies['coc-go']
  await writeJSON(pkgPath, pkg)

  await run(extensionsPath, 'yarn','add', 'coc-go')
}

const add = async () => {
  const pkg = await readJSON(pkgPath)
  pkg.dependencies['coc-go'] = '*'
  await writeJSON(pkgPath, pkg)

  await run('.', 'yarn','link')
  await run(extensionsPath, 'yarn','link', 'coc-go')
}

const readJSON = async (p) => new Promise(resolve => fs.readFile(p, (_, d) => resolve(JSON.parse(d))))
const writeJSON = async (p, c) => new Promise(resolve => fs.writeFile(p,  JSON.stringify(c, '', '  '), () => resolve()))

const run = async (p, cmd, ...a) => {
  return new Promise(resolve => {
    console.log(`> ${cmd} ${a.join(' ')}`)
    const c = spawn(cmd, a, { cwd: p })
    c.stdout.on('data', (l) => console.log(l.toString().replace(/\n$/, '')))
    c.stderr.on('data', (l) => console.log(l.toString().replace(/\n$/, '')))
    c.on('close', (code) => resolve(code))
  })
}

main(process.argv[2])
