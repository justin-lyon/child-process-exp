const stream = require('stream')

const transform = (chunk, enc, cb) => {
  console.log(`enc ${enc}`, chunk.toString())
  cb(null, chunk)
}

const create = () => {
  return new stream.Transform({
    transform
  })
}

module.exports = {
  create
}
