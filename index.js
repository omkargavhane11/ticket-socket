const dotenv = require("dotenv").config();
const io = require("socket.io")(process.env.PORT, {
    cors: {
        origin: process.env.CLIENT
    }
})

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });

}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    let user = users.find((user) => user.userId === userId);
    return user;
}

io.on("connection", (socket) => {
    console.log("query connected " + socket.id);

    socket.on("addQuery", (userId, queryId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    socket.on("disconnect", () => {
        console.log("query disconnected " + socket.id);
        removeUser(socket.id);
        io.emit("getUsers", users)
    })

    socket.on("sendMessage", ({
        senderId,
        recieverId,
        queryId,
        message,
    }) => {
        let user = getUser(recieverId);

        io.to(user?.socketId,).emit("getMessage", {
            senderId, message, queryId,
        })
    })

})




