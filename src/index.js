const { spawn } = require('child_process')
const fs = require('fs')
const { Readable } = require('stream')

const { toLines, git2Json, toJSON } = require("./transformers")

// Add Options as optional third argument to .spawn()
// cwd specifies the working directory, defaults to current
// env specifies the environment variables, defaults to process.env
// undefined values are ignored

// D:\workspace\bitbucket\lightning-training
// /Users/justin.lyon/Documents/workspace/bitbucket/lightning-training
const options = {
  cwd: 'D:/workspace/bitbucket/lightning-training',
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
const gitLog = spawn('git', gitLogArgs, options)

const oldMain = () => {
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
}

const newMain = () => {
  const isJson = /{.+}/g

  const isEmpty = str  => {
    return !str || str.length === 0
  }

  const burpGitLog = gitReader => {
    return new Promise((resolve, reject) => {
      const buffer = []
      gitReader
        .on('data', data => {
          buffer.push(data)
        })
        .on('end', () => {
          resolve(buffer)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  const readFileDiff = line => {
    const [status, ...paths] = line.split('\t')
    return {
      status,
      paths
    }
  }

  const print2Json = gitLogBuffer => {
    const lineReader = Readable()
    const lines = gitLogBuffer.toString().trim().split('\n')

    return lines.reduce((acc, line) => {
      if(isJson.test(line)) {
        acc.push(JSON.parse(line))

      } else if(!isEmpty(line)) {
        acc[acc.length - 1].changes.push(readFileDiff(line))
      }
      return acc;
    }, [])
  }

  const write2File = commits => {
    const writer = fs.createWriteStream('logs/data')
    writer.write(JSON.stringify(commits))
  }

  burpGitLog(gitLog.stdout)
    .then(print2Json)
    .then(write2File)
    .catch(err => {
      console.error(err)
    })
}

newMain()
