import https from 'https'

const options = {
  headers: {
    'User-Agent': `coc-go`,
  }
}

export function getJSON(url: string) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let body = ''

      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          reject(err)
        }
      })

    }).on('error', reject)
  })

}
