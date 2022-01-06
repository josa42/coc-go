import { StatusBarItem, window } from 'coc.nvim'

// eslint-disable-next-line no-unused-vars
export async function withProgress(text: string, fn: (status: StatusBarItem) => Promise<void>) {
  const status = window.createStatusBarItem(90, { progress: true })

  // Show status item at leaste one second
  let offset = 1000
  const t = setTimeout(() => (offset = 0), offset)
  const dispose = () => {
    clearTimeout(t)
    setTimeout(() => status.dispose(), offset)
  }

  status.text = text
  status.show()

  await fn(status)

  dispose()
}

