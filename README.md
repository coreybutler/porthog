# porthog

This module identifies which application is using a specified
port, providing the process name and PID. Works for Windows, OSX, and most flavors of Linux/Unix that support the `lsof`, `ss`, or `netstat` operations.

<table>
  <tr>
    <td>Windows, macOS, & Linux</td><td><a href"https://travis-ci.org/coreybutler/porthog"><img src="https://travis-ci.org/coreybutler/porthog.svg?branch=master"/></a></td>
    <td rowspan="2">
      <a href="https://github.com/feross/standard" target="_blank">
        <img src="https://cdn.rawgit.com/feross/standard/master/badge.svg"/>
      </a>
    </td>
    <td>
      <a href="https://npmjs.org/package/porthog" target="_blank"><img src="https://nodei.co/npm/porthog.png"/></a>
    </td>
  </tr>
</table>

## CLI Implementation

`npm install -g porthog`

`porthog 33649 80`

Outputs:

```sh
PORT      PID       PROCESS
--------------------------------------------------
33649     43580     node-webkit Helper (cbutler)
80        -         -
```

## API Implementation Example

```js
const porthog = require('porthog')
const data = porthog(80)

console.log(data.user, 'is running', data.process + ' (PID ' + data.pid + ') on port 80.')

// Output
// cbutler is running node.exe (PID 656) on port 80.
```

_This operation may require elevated/root privileges._

## Uses

We're using this in [Fenix Web Server](http://fenixwebserver.com)
to resolve port conflicts. When a user tries to launch a server
on an occupied port, we use porthog to determine which app is
"hogging" the port and provide the user an option to stop/kill the offending process.

We also use this in combination with [node-windows](https://github.com/coreybutler/node-windows),
[node-mac](https://github.com/coreybutler/node-mac), and
[node-linux](https://github.com/coreybutler/node-linux) to
create background processes that monitor ports and notify
users what's running on the ports they want to use.

There are certainly many other uses. If you use this, be
warned that some operating systems (Windows in particular)
may require elevated permissions. This is dependent on
each user's environment, so it's not always predictable. To
get around this, we've found the aforementioned node-* modules
to be useful when creating daemons (especially the [binary utilities and extra  scripts](https://github.com/coreybutler/node-windows/tree/master/bin) for Windows). For Electron/NW.js apps,
[sudo-prompt](https://github.com/jorangreef/sudo-prompt) has been
quite helpful.

# License

MIT
