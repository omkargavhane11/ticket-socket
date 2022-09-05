const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const io = require("socket.io")(PORT, {
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
    console.log("user connected " + socket.id);

    socket.on("addUser", userId => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    socket.on("disconnect", () => {
        console.log("user disconnected " + socket.id);
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

        io.to(user?.socketId).emit("getMessage", {
            senderId, message, queryId
        })
    })

})


io.listen(PORT, () => console.log("Socket started..."));

