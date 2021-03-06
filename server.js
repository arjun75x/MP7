var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("static"));

var room = io.of("/");

var players = {};

var getSpawn = function() {
	var width = 6000;
	var height = 4000;
    return [Math.round(Math.random() * width - width / 2), Math.round(Math.random() * height - height / 2)];
};

var randomColor = function() {
	// range from 20 to 330 to prevent red shades
    return `hsl(${Math.random() * 310 + 20}, 100%, ${Math.random() * 25 + 50}%)`;
};

io.on("connection", function(socket) {
    console.log(socket.client.id + " joined");
    var playerData = {
        id: socket.id,
        position: getSpawn(),
        velocity: [0, 0],
        color: randomColor()
    };
    socket.emit("init", playerData);
    socket.broadcast.emit("join", playerData);

    for (var id in players) {
        if (players.hasOwnProperty(id)) {
            socket.emit("join", players[id]);
        }
    }

    players[socket.id] = playerData;

    socket.on("disconnect", function(data) {
        console.log(socket.client.id + " left");
        delete players[socket.client.id];
        socket.broadcast.emit("leave", socket.client.id);
    });

    socket.on("update", function(data) {
        socket.broadcast.emit("update", data);
    });

    socket.on("bullet", function(data) {
        socket.broadcast.emit("bullet", data);
    });

    socket.on("hit", function(data) {
        socket.broadcast.emit("hit", data);
    });
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log(`Running on port ${port}...`);
});