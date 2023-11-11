const { v4: uuid } = require("uuid");

const rooms = {};

const isUserInAnyRoom = (user) => {
  for (const interest in rooms) {
    const room = rooms[interest];
    for (const existingRoom of room) {
      if (existingRoom.participants.includes(user)) {
        return true;
      }
    }
  }
  return false;
};

const removeUserFromRoom = (peerId) => {
  for (const interest in rooms) {
    const room = rooms[interest];
    const index = room.findIndex((existingRoom) =>
      existingRoom.participants.includes(peerId)
    );

    if (index !== -1) {
      const removedRoom = room[index];
      removedRoom.participants = removedRoom.participants.filter(
        (participant) => participant !== peerId
      );

      if (removedRoom.participants.length === 0) {
        rooms[interest].splice(index, 1);
      }
      return removedRoom.id;
    }
  }
  return null;
};

const roomHandler = (socket) => {
  const startMatch = ({ peerId, interest }) => {
    if (!rooms[interest]) {
      rooms[interest] = [];
    }

    const room = rooms[interest];

    if (isUserInAnyRoom(peerId)) {
      return;
    }

    const index = room.findIndex((r) => r.participants.length === 1);

    if (index !== -1) {
      const availableRoom = room[index];
      availableRoom.participants.push(peerId);
      const availableRoomId = availableRoom.id;
      socket.join(availableRoomId);
      socket.to(availableRoomId).emit("user-joined", peerId);
      console.log(`socket.join(${availableRoomId})`);
    } else {
      const newRoomId = uuid();
      const newRoom = {
        id: newRoomId,
        participants: [peerId],
      };
      room.push(newRoom);
      socket.join(newRoomId);
      socket.to(newRoomId).emit("user-joined", peerId);
      socket.to(newRoomId).emit("user-joined", peerId);
      console.log(`socket.join(${newRoomId})`);
    }

    console.log(JSON.stringify(rooms, null, 2));
  };

  const endCall = async (peerId) => {
    const roomId = await removeUserFromRoom(peerId);
    socket.leave(roomId);
  };

  socket.on("end-call", endCall);
  socket.on("stop-match", endCall);
  socket.on("start-match", startMatch);
};

module.exports = roomHandler;
