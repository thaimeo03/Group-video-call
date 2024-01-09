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

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private rooms: Map<string, Socket[]> = new Map()

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string; myId: string }) {
    const { roomId, myId } = payload
    console.log(`a new user ${myId} joined room ${roomId}`)

    client.join(roomId)
    client.broadcast.to(roomId).emit('user-connected', myId)
  }

  afterInit(server: Server) {
    console.log(server)
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`)
  }
}
