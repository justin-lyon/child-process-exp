const { Transform } = require('stream')

const init = () => {
  const items = []

  return new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, cb) {
      const enc = encoding || 'utf8'

      console.log('\n\nTO LINES TRANSFORM CHUNK STRING', chunk.toString())

      const groups = chunk.toString().trim().split('\n')
      items.concat(groups)
      return cb(null, groups)
    }
  })
}

module.exports = init
