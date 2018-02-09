'use strict'

const os = require('os')
const platform = os.platform()
const parser = require('./lib/parser')

module.exports = function (port) {
  let results = {}
  let stdout

  switch (platform) {
    case 'win32':
      results = parser.windows(port)
      break

    case 'linux':
      results = parser.linux(port)
      break

    case 'darwin':
      results = parser.lsof(port)
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
