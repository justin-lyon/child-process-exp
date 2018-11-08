const { Transform } = require('stream')

const isJson = /{.+}/g

const isEmpty = str  => {
  return !str || str.length === 0
}

const readFileDiff = line => {
  const parts = line.split('\t')
  return {
    status: parts[0],
    path: parts[1]
  }
}

const readGitLog = (chunkStr) => {
  return chunkStr
    .split('\n')
    .reduce((acc, line) => {
      if(isJson.test(line)) {
        acc.push(JSON.parse(line))

      } else if(!isEmpty(line)) {
        acc[acc.length - 1].changes.push(readFileDiff(line))
      }
      return acc;
    }, [])
}

const transform = (chunk, encoding, cb) => {
  const enc = encoding || 'utf8'
  const chunkStr = chunk.toString().trim()

  const commits = readGitLog(chunkStr)
  process.stdout.write('.')
  console.log('\nCOMMITS\n\n', JSON.stringify(commits, null, 2))

  cb(null, JSON.stringify(commits))
}

const create = () => {
  return new Transform({
    writeableObjectMode: true,
    transform
  })
}

module.exports = {
  create
}
