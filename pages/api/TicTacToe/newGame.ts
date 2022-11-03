import type { NextApiRequest, NextApiResponse } from 'next';
import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import base58 from 'bs58';
import * as borsh from 'borsh';
import { GameAccount, GameAccountSchema } from 'components/templates/TicTacToe/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { OWNER_PRIVATE_KEY } = process.env;
  const { player1, player2 } = req.body;

  if (!OWNER_PRIVATE_KEY) {
    throw new Error('Add Owner private key in env file.');
  }
  const key = Uint8Array.from(base58.decode(OWNER_PRIVATE_KEY));
  const keypair = Keypair.fromSecretKey(key);
  const { publicKey } = keypair;

  const Player1 = player1;
  const Player2 = player2;
  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programId) {
    throw new Error('Add Program Id in env file.');
  }
  const connection = new Connection(clusterApiUrl('devnet'));

  // Account Creation --- Start
  const GAME_ACCOUNT_SECRET = `${player1.substring(0, 5)}${player2.substring(0, 5)}`;

  const DATA_SIZE = borsh.serialize(GameAccountSchema, new GameAccount()).length;
  console.log(DATA_SIZE);

  const GameDataAccountPubkey = await PublicKey.createWithSeed(
    publicKey,
    GAME_ACCOUNT_SECRET,
    new PublicKey(programId),
  );

  const GameDataAccount = await connection.getAccountInfo(GameDataAccountPubkey);

  if (GameDataAccount === null) {
    console.log('Creating account', GameDataAccountPubkey.toBase58(), 'to play Tic-Tac-Toe');

    const lamports = await connection.getMinimumBalanceForRentExemption(DATA_SIZE);

    const AccountCreation = new Transaction();
    AccountCreation.add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: publicKey,
        basePubkey: publicKey,
        seed: GAME_ACCOUNT_SECRET,
        newAccountPubkey: GameDataAccountPubkey,
        lamports,
        space: DATA_SIZE,
        programId: new PublicKey(programId),
      }),
    );
    console.log('created AccountWithSeed', AccountCreation);
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendAndConfirmTransaction(connection, AccountCreation, [keypair], {
      minContextSlot,
      skipPreflight: true,
      preflightCommitment: 'processed',
    });
    const confirmtx = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    console.log({ signature, confirmtx });
  }
  // Account Creation --- END

  const transaction = new Transaction();
  transaction.add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: GameDataAccountPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(Player1),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: new PublicKey(Player2),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: new PublicKey(programId),
      data: Buffer.from([0, 0, 0]),
    }),
  );

  const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight },
  } = await connection.getLatestBlockhashAndContext();

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair], {
      minContextSlot,
      skipPreflight: true,
      preflightCommitment: 'processed',
    });

    const confirmtx = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    console.log({ signature, confirmtx });
    const data = await connection.getParsedTransaction(signature);

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
      console.error(error.message);
    }
  }
}
