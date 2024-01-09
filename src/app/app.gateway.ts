import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AppService } from 'src/app.service'

interface IUser {
  userId: string
  roomId: string
}

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private users: Map<Socket, IUser> = new Map()

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string; myId: string }) {
    const { roomId, myId } = payload
    console.log(`a new user ${myId} joined room ${roomId}`)

    this.users.set(client, { userId: myId, roomId })

    client.join(roomId)
    client.broadcast.to(roomId).emit('user-connected', myId)
  }

  @SubscribeMessage('user-leave')
  handleLeaveRoom(client: Socket, payload: { roomId: string; myId: string }) {
    const { roomId, myId } = payload
    client.join(roomId)
    client.broadcast.to(roomId).emit('user-leave', myId)
  }

  @SubscribeMessage('video-toggle')
  handleVideoToggle(client: Socket, payload: { roomId: string; myId: string }) {
    const { roomId, myId } = payload
    client.join(roomId)
    client.broadcast.to(roomId).emit('video-toggle', myId)
  }

  afterInit(server: Server) {
    console.log(server)
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(this.users)

    console.log(`Disconnected: ${client.id}`)
    const userLeaved = this.users.get(client)
    if (userLeaved) {
      const { roomId, userId } = userLeaved
      this.users.delete(client)
      client.broadcast.to(roomId).emit('user-leave', userId)
    }
  }
}
