import fs from 'fs'
import path from 'path'

export function createDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    return
  }

  createDir(path.dirname(dirPath))

  fs.mkdirSync(dirPath)
}

