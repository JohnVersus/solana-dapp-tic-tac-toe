import { Heading, Box, useColorModeValue, Button, Flex, useToast } from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

import { deserializeUnchecked } from 'borsh';
import Games from './Games';
import GameBoard from './GameBoard';
import NewGameForm from './NewGameForm';
import { GameAccount, GameAccountSchema, gameData } from 'components/templates/TicTacToe/types';

const TicTacToe: FC = () => {
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const [status, setStatus] = useState('');
  const toast = useToast();
  const [currentGame, setCurrentGame] = useState<gameData['data']>();
  const [gameAccounts, setGameAccounts] = useState<Array<gameData['data']>>([]);

  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programId) {
    throw new Error('Add Program Id in env file');
  }

  const connection = new Connection(clusterApiUrl('devnet'));

  const getProgramAccounts = async () => {
    setGameAccounts([]);
    setStatus('Updating Games');
    const data = await connection.getProgramAccounts(new PublicKey(programId));
    if (data.length) {
      data.forEach((e) => {
        console.log(e);
        const gameInput = deserializeUnchecked(GameAccountSchema, GameAccount, e.account.data);
        const accountId = e.pubkey;
        const game = { gameInput, accountId };
        console.log(data);
        setGameAccounts((existing) => [...existing, game]);
      });
      setStatus('');
    } else {
      setStatus('');
      throw toast({
        title: 'No games available',
        status: 'error',
        position: 'bottom-right',
        isClosable: true,
      });
    }
  };

  const loadGame = async (game: gameData['data']) => {
    console.log(game);
    setCurrentGame(game);
  };

  return (
    <>
      <Heading size="lg" marginBottom={6}>
        Tic Tac Toe 🕹️
      </Heading>
      <Tabs isFitted>
        <TabList>
          <Tab>Create Game</Tab>
          <Tab>Play Game</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex border="2px" borderColor={borderColor} borderRadius="xl" padding="24px 18px">
              <NewGameForm />
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex
              border="2px"
              borderColor={borderColor}
              borderRadius="xl"
              padding="24px 18px"
              flexDirection={'column'}
              alignItems={'center'}
            >
              <Box padding="24px 18px" maxHeight={'500'} gap={'8px'} overflow={'scroll'}>
                <Flex flexDirection={'column'} alignItems={'center'}>
                  <Heading size="sm" marginBottom={6}>
                    {gameAccounts.length ? 'Available Games!!' : 'Click to refresh games'}
                  </Heading>
                  <Flex overflow={'scroll'} maxWidth={'800px'} gap={'4px'}>
                    {gameAccounts &&
                      gameAccounts.map((game, i) => {
                        return (
                          <Games
                            key={i}
                            data={{ gameInput: game.gameInput, accountId: game.accountId }}
                            loadGame={() => {
                              loadGame(game);
                            }}
                          />
                        );
                      })}
                  </Flex>
                  <Button
                    maxWidth={'200px'}
                    minWidth={'150px'}
                    mt={4}
                    colorScheme="gray"
                    isLoading={status ? true : false}
                    onClick={getProgramAccounts}
                  >
                    Refresh Games
                  </Button>
                </Flex>
              </Box>
              <Box>
                <Flex flexDirection={'column'} alignItems={'center'}>
                  {currentGame && (
                    <GameBoard
                      data={{ gameInput: currentGame.gameInput, accountId: currentGame.accountId }}
                      connection={connection}
                    />
                  )}
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default TicTacToe;
