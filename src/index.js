const { spawn } = require('child_process')
const fs = require('fs')

const { toLines, git2Json, toJSON } = require("./transformers")

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

const logFile = fs.createWriteStream('logs/data')
const gitLog = spawn('git', gitLogArgs)

const jsonStrings = []
gitLog.stdout
  .pipe(toLines())
  .pipe(git2Json())
  .pipe(toJSON())
  .on('data', data => {
    jsonStrings.push(data)
  })
  .on('finish', data => {
    const payload = jsonStrings.join(',')
    logFile.write(`[${payload}]`, 'utf8')
    logFile.end()
  })
