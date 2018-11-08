const { Transform } = require('stream')

const transform = (chunk, encoding, cb) => {
  const enc = encoding || 'utf8'
  const lines = chunk.toString().trim().split('n')

  lines.forEach(line => this.push)
  cb()
}

const flush = cb => {
  cb()
}

const create = () => {
  return new Transform({
    writeableObjectMode: true,
    transform,
    flush
  })
}

module.exports = {
  create
}
