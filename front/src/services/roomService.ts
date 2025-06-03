import { postRequest } from "@/library/request";
import { type JoinRoomDto } from "@/validation/room.validation";

interface JoinRoomResponse {
  peers?: string[];
}

class RoomService {
  async joinRoom(peerId: string, socketId: string): Promise<JoinRoomResponse> {
    return await postRequest<JoinRoomDto, JoinRoomResponse>(
      "/room/join/local",
      {
        peerId,
        socketId,
      },
    );
  }
}

export const roomService = new RoomService();
