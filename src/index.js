const { spawn } = require('child_process')
const fs = require('fs')

// Add Options as optional third argument to .spawn()
// cwd specifies the working directory, defaults to current
// env specifies the environment variables, defaults to process.env
// undefined values are ignored

// D:\workspace\bitbucket\lightning-training
// /Users/justin.lyon/Documents/workspace/bitbucket/lightning-training
const options = {
  cwd: '/Users/justin.lyon/Documents/workspace/bitbucket/lightning-training',
  env: process.env
}

const gitLogFormat = '{"commit": "%H","author": "%aN <%aE>","date": "%ct %cr","message": "%s"}'
const gitLogArgs = [
  'log',
  '--first-parent',
  `--pretty=format:${gitLogFormat}`,
  '--name-status'
]
/* SAMPLE GIT LOG INPUT
{"commit": "5802daaa1bfaf0cd76e228a793db513162f875a5","author": "Justin Lyon <jml6487@gmail.com>","date": "1541542377","message": "remove mentions of super components", "changes": []}
M	training/04-api-components/README.md
M	training/README.md

{"commit": "e602049b75435330a29a0be237ca452bc9aa48e7","author": "Justin Lyon <jml6487@gmail.com>","date": "1541512604","message": "Merged in 2018-activity-04 (pull request #4)", "changes": []}
{"commit": "d98e42f0bef27ee0b0626af12b0b0f72fbdab725","author": "Justin Lyon <jml6487@gmail.com>","date": "1541175178","message": "we don't have src anymore", "changes": []}
M	training/03-custom-search/03.04-client-side-table.md
*/

/* SAMPLE JSON OUTPUT
[
   {
      "commit":"5802daaa1bfaf0cd76e228a793db513162f875a5",
      "author":"Justin Lyon <jml6487@gmail.com>",
      "date":"1541542377",
      "message":"remove mentions of super components",
      "ancestors":[],
      "changes":[
         {
            "status":"M",
            "paths":[
               "training/04-api-components/README.md"
            ]
         },
         {
            "status":"M",
            "paths":[
               "training/README.md"
            ]
         }
      ]
   },
   {
      "commit":"e602049b75435330a29a0be237ca452bc9aa48e7",
      "author":"Justin Lyon <jml6487@gmail.com>",
      "date":"1541512604",
      "message":"Merged in 2018-activity-04 (pull request #4)",
      "ancestors":[
         {
            "commit":"d98e42f0bef27ee0b0626af12b0b0f72fbdab725",
            "author":"Justin Lyon <jml6487@gmail.com>",
            "date":"1541175178",
            "message":"we don't have src anymore"
         }
      ],
      "changes":[
         {
            "status":"M",
            "paths":[
               "training/03-custom-search/03.04-client-side-table.md"
            ]
         }
      ]
   }
 ]
*/

const logFile = fs.createWriteStream('logs/data')
const gitLog = spawn('git', gitLogArgs, options)

const isJSON = /{.+}/

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
        resolve(buffer.join(''))
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
  const lines = gitLogBuffer.toString().trim().split('\n')

  return lines.reduce((acc, line) => {
    const index = acc.length > 0 ? acc.length - 1 : 0

    if(isJSON.test(line)) {
      // If this is a commit
      if(acc[index] && acc[index].changes.length === 0) {
        // If acc is a commit but no changes, then this is an ancestor commit
        acc[index].ancestors.push(JSON.parse(line))
      } else {
        // Add new commit to acc
        const commit = JSON.parse(line);
        commit.ancestors = []
        commit.changes = []
        acc.push(commit)
      }

    } else if(!isEmpty(line)) {
      // Add file change to commit

      acc[index].changes.push(readFileDiff(line))
    }
    return acc
  }, [])
}

const write2File = commits => {
  const writer = fs.createWriteStream('logs/data')
  writer.write(JSON.stringify(commits, null, 2))
}

burpGitLog(gitLog.stdout)
  .then(print2Json)
  .then(write2File)
  .catch(err => {
    console.error(err)
  })
