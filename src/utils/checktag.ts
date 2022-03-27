import { getJSON } from './request'

const releaseFilter = /^v\d+\.\d+\.\d+$/

interface Tag {
  name: string
  zipball_url: string
  tarball_url: string
  commit: {
    sha: string
    url: string
  }
  node_id: string
}

export default async function checkLatestTag(repo: string, prefixFilter?: RegExp): Promise<string> {
  const data = await getJSON(`https://api.github.com/repos/${repo}/tags`) as Array<Tag>

  if (!Array.isArray(data)) {
    return ''
  }

  let tags = data.map(t => t.name)

  if (prefixFilter) {
    tags = tags
      .filter(t => t.match(prefixFilter))
      .map(t => t.replace(prefixFilter, ''))
  }

  tags = tags
    .filter(t => t.match(releaseFilter))


  return tags.length > 0
    ? tags[0].replace(/^v/, '')
    : ''
}
