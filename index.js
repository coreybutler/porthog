'use strict'

const os = require('os')
const platform = os.platform()
const exec = require('child_process').execSync
let cr = '\n'

module.exports = function (port) {
  let results = {}

  switch (platform) {
    case 'win32':
      cr = '\r' + cr
      stdout = exec('netstat -aon | findstr :' + port + ' | findstr LISTENING').toString().trim().split(cr)

      stdout.forEach((row) => {
        let item = row.trim().split(/\s{1,500}/)
        let processport = item[1].split(':').pop()

        if (!isNaN(processport)) {
          processport = parseInt(processport, 10)

          if (processport === port) {
            results[item.pop()] = {}
          }
        }
      })

      Object.keys(results).forEach((pid) => {
        let out = exec('tasklist /FI \"PID eq ' + pid + '\" /FO CSV /NH /V').toString().trim().split(cr)
        out.forEach((row) => {
          let col = row.split(',')

          results[pid] = {
            process: col[0].substr(1, col[0].length - 2),
            user: col[6].substr(1, col[6].length - 2)
          }
        })
      })

      break

    case 'linux':
    case 'darwin':
      let stdout = exec('lsof -i :' + port).toString().trim().split('\n')
      stdout.shift()

      stdout.forEach(row => {
        let item = row.split(/\s{1,500}/)
        item.pop()
        let processport = item.pop().replace(/[^0-9]/gi, '')
        if (!isNaN(processport)) {
          processport = parseInt(processport, 10)

          if (processport === port) {
            results[item[1]] = {
              process: item[0],
              user: item[2]
            }
          }
        }
      })

      break

    default:
      console.warn(platform + ' operating system not supported.')
      return null
  }

  let pids = Object.keys(results)
  switch (pids.length) {
    case 0:
      return null

    case 1:
      let data = results[pids[0]]
      data.pid = pids[0]

      return data

    default:
      console.warn('Recognized more than one process running on port ' + port + '!')
      return results
  }
}
