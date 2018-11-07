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
  `--pretty=format:${gitLogFormat}`
]
const gitDiffArgs = [
  'show',
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

const logFile = fs.createWriteStream('./logs/log.txt')
//const gitStatus = spawn('git', ['status'])
const gitLog = spawn('git', gitLogArgs)

gitLog.stdout.pipe(logFile)

// Required so node process ends. Else, Node may hang on the child process.
const bufs = [];
const changesBuffer = []
gitLog.on('exit', (code, signal) => {
  onExit(code, signal)

  const commits = bufs.join('').toString().trim().split('\n')
    .map(bufStr => JSON.parse(bufStr))

  const hashes = commits.map(c => c.commit)

  hashes.forEach(hash => {
    const args = [
      ...gitDiffArgs,
      hash
    ]
    const fileDetails = spawn('git', args)

    fileDetails.stdout.on('data', data => {
      changesBuffer.push({
        hash,
        data: data.toString().trim().split('\n')
      })
    })
    fileDetails.on('exit', (code, signal) => {
      onExit(code, signal)
      console.log('changes', JSON.stringify(changesBuffer, null, 2))
    })
  })

  console.log('commits', commits)
  console.log('hashes', hashes)
})

gitLog.stdout.on('data', data => {
  bufs.push(data);
})
//gitStatus.on('exit', onExit)

// Not necessary for my use case, but event emitters are also possible.
// gitStatus.stdout.on('data', onStdOut)
// gitStatus.stdin.on('data', onStdIn)
