const { Transform } = require('stream')

const transform = (objs, encoding, cb) => {

  console.log('\n\nTO JSON TRANSFORM OBJs', objs)

  const payload = objs.map(o => {
    return JSON.stringify(o)
  }).join(',')
  console.log('\nPAYLOAD\n', payload)
  return cb(null, payload)
}

const init = () => {
  return new Transform({
    writableObjectMode: true,
    transform
  })
}

module.exports = init
