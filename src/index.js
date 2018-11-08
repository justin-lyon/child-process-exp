const { spawn } = require('child_process')
const fs = require('fs')

// Add Options as optional third argument to .spawn()
// cwd specifies the working directory, defaults to current
// env specifies the environment variables, defaults to process.env
// undefined values are ignored
const options = {
  cwd: '/Users/justin.lyon/Documents/workspace/bitbucket/lightning-training',
  env: process.env
}

const gitLogFormat = '{"commit": "%H","author": "%aN <%aE>","date": "%ct","message": "%s", "changes": []}'
const gitLogArgs = [
  'log',
  '--first-parent',
  `--pretty=format:${gitLogFormat}`,
  '--name-status'
]

const onExit = (code, signal) => {
  console.log(`Child process exited with code ${code} and signal ${signal}.`)
}

const onStdOut = data => {
  console.log(`child stdout:\n${data}`)
}

const onStdIn = data => {
  console.log(`child stdout:\n${data}`)
}

const isEmpty = str  => {
  return !str || str.length === 0
}

// const isBlank = str => {
//   return !str || /^\s*$/.test(str)
// }

const getWriteStream = path => {
  try {
    const stream = fs.createWriteStream(path)
    return stream
  } catch(e) {
    fs.writeFile(path, '', err => {
      getWriteStream(path)
    })
  }
}

const logFile = getWriteStream('log.txt')
//const gitStatus = spawn('git', ['status'])
const gitLog = spawn('git', gitLogArgs)

gitLog.stdout.pipe(logFile)

const bufs = [];
const isJson = /{.+}/g
// Required so node process ends. Else, Node may hang on the child process.
gitLog.on('exit', (code, signal) => {
  onExit(code, signal)

  const commits = bufs.join('').toString().trim().split('\n')
    .reduce((acc, bufStr) => {
      if(isJson.test(bufStr)) {
        acc.push(JSON.parse(bufStr))
      } else if(!isEmpty(bufStr)) {
        const parts = bufStr.split('\t')
        const change = {
          status: parts[0],
          file: parts[1]
        }
        acc[acc.length - 1].changes.push(change)
      }
      return acc
    }, [])

  console.log('commits', JSON.stringify(commits, null, 2))
})

gitLog.stdout.on('data', data => {
  bufs.push(data);
})
//gitStatus.on('exit', onExit)

// Not necessary for my use case, but event emitters are also possible.
// gitStatus.stdout.on('data', onStdOut)
// gitStatus.stdin.on('data', onStdIn)
