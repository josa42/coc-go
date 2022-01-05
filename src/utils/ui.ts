import { window } from 'coc.nvim'

export async function select(options: string[], allowAll = false): Promise<string[]> {
  if (options.length > 0) {
    const allOptions = allowAll ? ['-- All --', ...options] : options
    const idx = await window.showQuickpick(allOptions)

    if (idx !== -1) {
      if (allowAll && idx === 0) {
        return options
      }

      return [allOptions[idx]]
    }
  }

  return []
}

