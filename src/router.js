var get = require('get')
var {base} = require('./data')
var Game = require('./game')
var Room = require('./room')
var Sock = require('./sock')
var util = require('./util')

var rooms = {
  lobby: new Room
}

function create(opts) {
  try {
    util.game(opts)
  } catch(err) {
    return this.err(err.message)
  }

  var g = new Game(opts)
  rooms[g.id] = g
  g.once('kill', kill)

  var url = base + encodeURIComponent('drafts.in/#q/' + g.id)
  get(url, (err, data) => {
    if (err)
      this.err(err)
    else
      this.send('set', { url: data })
  })
}

function join(roomID) {
  var room = rooms[roomID]
  if (!room)
    return this.err(`room ${roomID} not found`)
  this.exit()
  room.join(this)
}

function kill() {
  delete rooms[this.id]
}

module.exports = function (ws) {
  var sock = new Sock(ws)
  sock.on('join', join)
  sock.on('create', create)
}
