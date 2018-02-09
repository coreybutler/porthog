const exec = require('child_process').execSync

const portmap = {
  http: 80,
  https: 443,
  ssh: 22,
  dns: 53,
  ftp: 20,
  telnet: 23,
  smtp: 25,
  ntp: 37,
  pop2: 109,
  pop3: 110,
  sftp: 115,
  nntp: 119,
  snmp: 169,
  bgp: 179,
  gacp: 190,
  irc: 194,
  dls: 197,
  ldap: 389,
  snpp: 444,
  sldap: 689
}

let cr = '\n'

class Parser {
  static windows (port) {
    let results = {}
    let stdout

    cr = '\r' + cr

    try {
      stdout = exec('netstat -aon | findstr :' + port + ' | findstr LISTENING').toString().trim().split(cr)
    } catch (e) {
      stdout = []
    }

    stdout.forEach((row) => {
      let item = row.trim().split(/\s{1,500}/)
      let processport = item[1].split(':').pop()

      if (!isNaN(processport)) {
        processport = parseInt(processport, 10)

        if (processport === parseInt(port, 10)) {
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

    return results
  }

  static linux (port) {
    // Attempt lsof first
    try {
      return this.ss(port)
    } catch (e) {
      console.log(e)
      // Attempt ss next
      try {
        return this.lsof(port)
      } catch (e) {
        // Attempt netstat last
        try {
          return this.netstat(port)
        } catch (e) {
          console.log('Could not find lsof, ss, or netstat to determine port usage.')
          return {}
        }
      }
    }
  }

  static lsof (port) {
    let stdout = exec('lsof -i :' + port).toString().trim().split('\n')
    let results = {}

    if (stdout.length === 0) {
      return {}
    }

    stdout.shift()

    stdout.forEach(row => {
      if (row.indexOf('(LISTEN)') > 0) {
        let item = row.split(/\s{1,500}/)

        item.pop()

        let processport = item.pop().replace(/[^0-9]/gi, '')

        if (!isNaN(processport)) {
          processport = parseInt(processport, 10)

          let detail = this.linuxProcessDetails(item[1])

          results[item[1]] = {
            process: processport === parseInt(port, 10) ? detail.title : item[0],
            user: detail.user
          }
        }
      }
    })

    return results
  }

  static ss (port = '') {
console.log('>>>', port)
    let stdout = exec('ss -ptls | grep LISTEN').toString().trim().split('\n')
    let results = {}

    if (stdout.length === 0) {
      return {}
    }

    port = port.toString().split(' ').filter(number => !isNaN(number))
console.log(port)
    stdout.forEach(row => {
      // Group 1 is port
      let data = /:{3}([A-Za-z0-9]+)/i.exec(row)

      // Handle named ports
      if (data !== null) {
        if (isNaN(data[1]) && portmap.hasOwnProperty(data[1].toLowerCase())) {
          data[1] = portmap[data[1].toLowerCase()].toString()
        }
      }

      if (port.indexOf(data[1].toString()) >= 0) {
        let ct = 0
        let PID = /\(\"([A-Za-z]+)\".*pid=([0-9]+)/i.exec(data.input)

        while (PID !== null && ct < 100) {
          let detail = this.linuxProcessDetails(PID[2])

          results[PID[2]] = {
            process: detail.title,
            user: detail.user
          }

          data.input = data.input.replace(`pid=${PID[2]}`)
          PID = /\(\"([A-Za-z]+)\".*pid=([0-9]+)/i.exec(data.input)
          ct++
        }
      }
    })

    return results
  }

  static netstat (port) {
    let stdout = exec('netstat -tulnp | grep ' + port)
    let results = {}

    if (stdout.length === 0) {
      return {}
    }

    stdout.split('\n').forEach(row => {
      let data = row.split(/\s+/).pop().split(/\/|\\/)
      let detail = this.linuxProcessDetails(data[0])

      results[data[0]] = {
        process: detail.title,
        user: detail.user
      }
    })

    return results
  }

  static linuxProcessDetails (pid) {
    let processDetail = exec('ps axco pid,command | grep ' + pid)
      .toString()
      .split('\n')
      .filter(line => line.indexOf('grep') < 0)[0]
      .trim()
      .split(/\s+/)

    let user = processDetail[1]

    processDetail.splice(0, process.platform === 'darwin' ? 1 : 3)

    return {
      user,
      title: processDetail.join(' ')
    }
  }
}

module.exports = Parser
