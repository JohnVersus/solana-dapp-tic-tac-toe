/* eslint-disable no-undef */
import { FormControl, FormLabel, Input, Box, Flex, Button, useToast, FormHelperText } from '@chakra-ui/react';
import { FC, useState, ChangeEvent } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import apiPost from 'utils/apiPost';

const NewGameForm: FC = () => {
  const [player2, setPlayer2] = useState('');
  const [status, SetStatus] = useState('');
  const toast = useToast();

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayer2(e.target.value);
  };

  const { publicKey } = useWallet();

  const createGame = async () => {
    if (!publicKey || !player2) {
      throw toast({
        title: 'Required player addresses',
        status: 'error',
        position: 'bottom-right',
        isClosable: true,
      });
    }
    if (publicKey?.toBase58() === player2) {
      throw toast({
        title: 'Different wallet addresses required',
        status: 'error',
        position: 'bottom-right',
        isClosable: true,
      });
    }

    const players = {
      player1: publicKey,
      player2: new PublicKey(player2),
    };
    console.log(players);
    try {
      SetStatus('Transaction in progress');
      // Callign the `newGame` api route to create a new game
      const data = await apiPost('/TicTacToe/newGame', players);
      console.log(data);
      toast({
        title: 'Created Sucessfully!!',
        description: 'Visit Play Game tab to play!!',
        status: 'success',
        position: 'bottom-right',
        isClosable: true,
      });
      SetStatus('');
    } catch (e) {
      SetStatus('');
      toast({
        title: 'Error Occured',
        status: 'success',
        position: 'bottom-right',
        isClosable: true,
      });
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
  };

  return (
    <>
      <FormControl>
        <Flex height={'300px'} direction={'column'} alignItems={'center'} justifyContent={'space-around'}>
          <Box width={'50%'}>
            <FormLabel>Player 1</FormLabel>
            <Input placeholder="Connect to Wallet" value={`${publicKey ? publicKey : ''}`} disabled />
          </Box>
          <Box width={'50%'}>
            <FormLabel>Player 2</FormLabel>
            <Input placeholder="Player 2 Address" onChange={handleInput} />
          </Box>
          <Button width={'50%'} mt={4} colorScheme="teal" isLoading={status ? true : false} onClick={createGame}>
            Create New Game
          </Button>
          <FormHelperText>{status && status}</FormHelperText>
        </Flex>
      </FormControl>
    </>
  );
};

export default NewGameForm;
