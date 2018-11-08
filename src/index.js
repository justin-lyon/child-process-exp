const { spawn } = require('child_process')
const fs = require('fs')
const { create: createGitTranslator } = require('./git-transform')
const { create: splitter } = require('./split')

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

// const splitLines = splitter()
const gitParser = createGitTranslator()

const logFile = fs.createWriteStream('logs/data')
//const gitStatus = spawn('git', ['status'])
const gitLog = spawn('git', gitLogArgs)

gitLog.stdout
//  .pipe(splitLines)
  .pipe(gitParser)
  .pipe(process.stdout)
//gitParser.pipe(logFile)

//gitStatus.on('exit', onExit)

// Not necessary for my use case, but event emitters are also possible.
// gitStatus.stdout.on('data', onStdOut)
// gitStatus.stdin.on('data', onStdIn)
