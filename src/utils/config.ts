import fs from 'fs'
import path from 'path'

export interface GoTagsConfig {
  tags?: string
  options?: string
  transform?: string
}

export async function configDir(...names: string[]): Promise<string> {
  const home = require('os').homedir()
  const dir = path.join(home, '.config', 'coc', 'go', ...names)

  return new Promise((resolve) => {
    fs.mkdirSync(dir, { recursive: true })
    resolve(dir)
  })
}
