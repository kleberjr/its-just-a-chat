import { Server as HttpServer, IncomingMessage } from "http";
import { DisconnectReason, Server as IOServer } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./interfaces";
import { IOSocket, UserPayload } from "./types";
import jwt from 'jsonwebtoken';

export const startSocketServer = async (httpServer: HttpServer) => {
  const io = 
    new IOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(
      httpServer, 
      { connectionStateRecovery: {} }
    );

  io.on('connection', (socket: IOSocket) => {
    if (socket.recovered) {
      console.log(`Socket ${socket.id} reconnected to server\n`);
    } else {
      console.log(`Socket ${socket.id} connected to server\n`);
    }

    enableStateRecovery(socket);

    socket.on('chatMessage', (message: string) => {
      const userPayload = getUserPayload(socket.request);

      // Broadcast the message to every socket but this one
      socket.broadcast.emit('chatMessage', userPayload, message);
    });

    socket.on('disconnect', (reason: DisconnectReason, descriptions?: any) => {
      console.log(`Socket ${socket.id} disconnected from server: ${reason}`);
      console.log(`Descriptions: ${descriptions}\n`);
    });
  });
};

const enableStateRecovery = (socket: IOSocket) => {
  // The server needs to emit at least one event in order for connection state recory to work 
  socket.emit('enableStateRecovery');
};

const getUserPayload = (request: IncomingMessage): UserPayload => {
  const cookie = request.headers.cookie!;
  const [cookieName, token] = cookie.split('=');
  const payload = jwt.decode(token) ?? {};
    
  return {
    id: payload['id'],
    name: payload['name'],
    email: payload['email'],
  };
}