const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const socketio = require('socket.io')
const http = require('http');
const { createBrotliCompress } = require('zlib');
const { SSL_OP_NO_TICKET } = require('constants');

const server = http.createServer(app);
const io = socketio(server);

const storoom = {}       //key=socket.id, val=roomid
const roomtos = {}       //key=roomid, val=array of socket ids in that room
const socketid = {};     //key=peerid, val=socket.id
const peeridmap = {}     //key=socketid, val=peerid
const peerid = [];       //array of peerids
const userNamesDict = {} //key-socket.id, val=userName

//returns logo (image API)
app.get("/icon-128.png", (req, res) => {
    res.sendFile(__dirname + '/public/images/icon-128.png');
})

//for baseUrl returns homepage html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/homePage.html');
})

//(image API)
app.get('/user.png', (req, res) => {
    res.sendFile(__dirname + '/public/images/user.png');
})

//returns Github logo (image API)
app.get('/github.png', (req, res) => {
    res.sendFile(__dirname + '/public/images/github.png');
})

//on clicking create room, we get redirected to /room, where we generate unique roomID and redirect to that room
app.get('/room', (req, res) => {
    var roomid = uuidv4();
    createRoom(roomid); //loads html of room for /roomid
    res.redirect('/' + roomid);
})

//styles
app.get('/public/styles/homePage.css', (req, res) => {
    res.sendFile(__dirname + '/public/styles/homePage.css');
})

//styles
app.get('/public/styles/room.css', (req, res) => {
    res.sendFile(__dirname + '/public/styles/room.css');
})

app.get('/public/scripts/script.js', (req, res) => {
    res.sendFile(__dirname + '/public/scripts/script.js');
})

function createRoom(roomid) {
    app.get('/' + roomid, (req, res) => {
        res.sendFile(__dirname + '/views/room.html');
    })
}

//script for each room
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/public/scripts/script.js');
})

//websocket pipeline established  between new client and server
io.on('connection', socket => {
    socket.broadcast.emit('connected')
    socket.on('send-message', obj => {
        for (var i = 0; i < roomtos[obj.roomid].length; i++) {
            if (socket.id != roomtos[obj.roomid][i]) {
                let name = userNamesDict[socket.id];
                io.to(roomtos[obj.roomid][i]).emit('receive-message', { name: name, message: obj.message });
            }
        }
    })
    
    //client send their name to server
    socket.on('send-userName', userName => {
        userNamesDict[socket.id] = userName;
        socket.to(roomtos[storoom[socket.id]]).emit('new-user-joined', userName);
    })
    
    //maintaining roomtos =>room to socketid 
    socket.on('send-roomid', roomid => {
        storoom[socket.id] = roomid;
        if (roomtos[roomid] != undefined) {
            roomtos[roomid].push(socket.id);
        }
        else {
            roomtos[roomid] = [socket.id];
        }
    })
    
    //signalling, user(client) send their peerid to server
    socket.on('send-peerId', id => {

        peerid.push(id);
        socketid[id] = socket.id;
        peeridmap[socket.id] = id;
        for (var i = 0; i < roomtos[storoom[socketid[id]]].length; ++i) {
            if (roomtos[storoom[socketid[id]]][i] != socket.id) {
                socket.emit('receive-peerId-and-call', { otherPeerId: peeridmap[roomtos[storoom[socketid[id]]][i]], name: userNamesDict[roomtos[storoom[socketid[id]]][i]] });
                io.to(roomtos[storoom[socketid[id]]][i]).emit('receive-caller-name', userNamesDict[socket.id]);
            }
        }
    }
    )
    
    //server sends the caller name to clinet who wil receive the call
    socket.on('get-caller-name', peerid => {
        socket.emit('receive-caller-name', userNamesDict[socketid[peerid]]);
    })

    //remove the clinets data who left the room
    socket.on('disconnect', () => {
        for (var i = 0; i < roomtos[storoom[socket.id]].length; i++) {
            if (roomtos[storoom[socket.id]][i] == socket.id) {
                roomtos[storoom[socket.id]].splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < peerid.length; i++) {
            if (socketid[peerid[i]] == socket.id) {
                var obj = {
                    name: userNamesDict[socket.id],
                    peerid: peerid[i]
                }
                io.in(roomtos[storoom[socket.id]]).emit('user-disconnected', obj);
                delete peeridmap[socket.id];
                delete userNamesDict[socket.id];
                delete storoom[socket.id];
                delete socketid[peerid[i]];
                peerid.splice(i, 1);
                break;
            }

        }

    }
    )
})

var Port = process.env.PORT || 3232;
server.listen(Port, () => {
    console.log('server started');

})
