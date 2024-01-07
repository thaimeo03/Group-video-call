import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'

@Injectable()
export class AppService {
  private rooms: Map<string, Socket[]> = new Map()
}
