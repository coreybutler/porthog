#!/usr/bin/env node
'use strict'

let args = process.argv.splice(2, process.argv.length)

if (args.length === 0) {
  console.log('Please specify a port.')
  process.exit(0)
}

let PortHog = require('./index')
let data = []

args.forEach(port => {
  let pdata = PortHog(port)
  if (pdata !== null) {
    pdata.port = port
    data.push(pdata)
  } else {
    data.push({
      port: port,
      pid: '-',
      process: '-',
      user: ''
    })
  }
})

if (data.length === 0) {
  console.log('\nNothing running on the specified port(s).\n')
  process.exit(0)
}

console.log('\nPORT      PID       PROCESS\n--------------------------------------------------')
data.forEach(item => {
  let str = item.port
  for (let i = 0; i < (10 - item.port.length); i++) {
    str = str + ' '
  }
  str = str + item.pid
  for (let i = 0; i < (10 - item.pid.length); i++) {
    str = str + ' '
  }
  str = str + item.process.replace(/\n{1,10}/, '') + (item.user.trim().length > 0 ? ' (' + item.user + ')' : '')

  console.log(str)
})
console.log('\n')
