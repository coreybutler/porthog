'use strict'

const porthog = require('../')
const test = require('tap').test
const http = require('http')

test('Basic Test', function (t) {
  const server = http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end('Hello World\n')
  })

  server.listen(0, () => {
    let data = porthog(server.address().port)

    t.ok(data !== null, 'Identified a port in use.')
    t.ok(data.process.indexOf('node') >= 0, 'Proper process name recognized (node).')
    t.ok(data.pid.trim().length > 0, 'A PID was identified.')
    t.ok(data.user.trim().length > 0, 'A username was provided.')

    server.on('close', () => {
      t.end()
    })

    server.close()
  })
})
