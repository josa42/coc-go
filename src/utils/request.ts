import https from 'https';
import pkg from '../../package.json'

const options = {
  headers: {
    'User-Agent': `coc-go/${pkg.version}`,
  }
}

export function getJSON(url: string) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        };
      });

    }).on('error', reject)
  })

}
