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

const readGitLog = (lines) => {
  return lines
    .reduce((acc, line) => {
      if(isJson.test(line)) {
        acc.push(JSON.parse(line))

      } else if(!isEmpty(line)) {
        acc[acc.length - 1].changes.push(readFileDiff(line))
      }
      return acc;
    }, [])
}

const transform = (lines, encoding, cb) => {
  const enc = encoding || 'utf8'
  console.log('\n\nGIT TRANSFORM LINES', lines)

  const commits = readGitLog(lines)

  return cb(null, commits)
}

const init = () => {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    writeableHighWaterMark: 1,
    transform
  })
}

module.exports = init
