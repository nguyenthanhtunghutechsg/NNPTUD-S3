let { Server } = require('socket.io')
let jwt = require('jsonwebtoken')
let userSchema = require('../schemas/users')

module.exports = {
    serverSocket: function (server) {
        let io = new Server(server);
        io.on('connection', async (socket) => {
            let token = socket.handshake.auth.token;
            let result = jwt.verify(token, 'secretKey')
            if (result.exp * 1000 > Date.now()) {
                let id = result.id;
                let user = await userSchema.findById(id);
                socket.join(id)
                socket.emit('welcome', user.username)
            }
            socket.on('userMessage', data => {
                console.log("da join phong "+data);
                socket.join(data)
            })
            socket.on('newMessage', data => {
                io.to(data.to).to(data.from).emit("newMessage")
            })
        });
    }
}