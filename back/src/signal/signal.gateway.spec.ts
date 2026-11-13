import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { SignalGateway } from './signal.gateway';
import { RedisService } from 'src/redis/redis.service';
import { StatsService } from '../stats/stats.service';

describe('SignalGateway', () => {
  let gateway: SignalGateway;
  let emit: jest.Mock;
  let socketCalls: string[];
  let redis: {
    getClient: jest.Mock;
    removeClient: jest.Mock;
    getClients: jest.Mock;
    addPeer: jest.Mock;
  };

  const makeSocket = (roomId: string): Socket =>
    ({
      id: 'old-socket',
      data: { roomId },
      request: { headers: {}, socket: { remoteAddress: '127.0.0.1' } },
      leave: jest.fn((room: string) => {
        socketCalls.push(`leave ${room}`);
      }),
      join: jest.fn((room: string) => {
        socketCalls.push(`join ${room}`);
      }),
      emit: jest.fn(),
    }) as unknown as Socket;

  beforeEach(async () => {
    socketCalls = [];
    redis = {
      getClient: jest.fn().mockResolvedValue('peer-A'),
      removeClient: jest.fn().mockResolvedValue(true),
      getClients: jest.fn().mockResolvedValue({}),
      addPeer: jest.fn().mockResolvedValue(undefined),
    };
    emit = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalGateway,
        { provide: RedisService, useValue: redis },
        { provide: StatsService, useValue: { updateStats: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<SignalGateway>(SignalGateway);
    gateway.afterInit({
      to: jest.fn().mockReturnValue({ emit }),
      in: jest.fn().mockReturnValue({
        fetchSockets: jest.fn().mockResolvedValue([]),
      }),
    } as never);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleDisconnect', () => {
    it('broadcasts peer-left when the peer has no other socket in the room', async () => {
      await gateway.handleDisconnect(makeSocket('room:ABCD'));

      expect(redis.removeClient).toHaveBeenCalledWith(
        'room:ABCD',
        'old-socket',
      );
      expect(emit).toHaveBeenCalledWith('peer-left', 'peer-A');
    });

    it('stays silent when the same peer already rejoined under another socket', async () => {
      redis.getClients.mockResolvedValue({ 'new-socket': 'peer-A' });

      await gateway.handleDisconnect(makeSocket('room:ABCD'));

      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe('handleLeaveRoom', () => {
    it('broadcasts peer-left when the peer has no other socket in the room', async () => {
      await gateway.handleLeaveRoom(makeSocket('room:ABCD'));

      expect(emit).toHaveBeenCalledWith('peer-left', 'peer-A');
    });

    it('stays silent when the same peer already rejoined under another socket', async () => {
      redis.getClients.mockResolvedValue({ 'new-socket': 'peer-A' });

      await gateway.handleLeaveRoom(makeSocket('room:ABCD'));

      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinRoom', () => {
    it('leaves the current room before joining the requested one', async () => {
      await gateway.handleJoinRoom(
        { peerId: 'peer-A', roomCode: 'wxyz' },
        makeSocket('room:ABCD'),
      );

      expect(socketCalls).toEqual(['leave room:ABCD', 'join room:WXYZ']);
      expect(emit).toHaveBeenCalledWith('peer-left', 'peer-A');
    });
  });
});
