import { Connection, PublicKey } from '@solana/web3.js';
import { MouseEventHandler } from 'react';

export interface gameData {
  data: {
    gameInput: GameAccount;
    accountId: PublicKey;
  };
}

export interface BoardInput extends gameData {
  connection: Connection;
}
export interface GameInput extends gameData {
  // eslint-disable-next-line no-undef
  loadGame: MouseEventHandler<HTMLDivElement>;
}

export class GameAccount {
  player1 = '9s3crrmpA61RXDJK5Xfhztpv4enhmsDd9ziDs4kHJaZ2';
  player2 = '9s3crrmpA61RXDJK5Xfhztpv4enhmsDd9ziDs4kHJaZ2';
  moves = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  game_status = 0;
  next_move = 0;
  constructor(
    fields:
      | {
          player1: string;
          player2: string;
          moves: Array<number>;
          game_status: number;
          next_move: number;
        }
      | undefined = undefined,
  ) {
    if (fields) {
      this.player1 = fields.player1;
      this.player2 = fields.player2;
      this.game_status = fields.game_status;
      this.moves = fields.moves;
      this.next_move = fields.next_move;
    }
  }
}
export const GameAccountSchema = new Map([
  [
    GameAccount,
    {
      kind: 'struct',
      fields: [
        ['player1', 'string'],
        ['player2', 'string'],
        ['moves', ['u32', 9]],
        ['game_status', 'u32'],
        ['next_move', 'u32'],
      ],
    },
  ],
]);
