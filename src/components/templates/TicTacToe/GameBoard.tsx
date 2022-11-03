import { Box, Flex, Grid, SimpleGrid, Spinner, useColorModeValue, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FC } from 'react';
import { BoardInput } from './types';
import { getEllipsisTxt } from '../../../utils/format';
import { useWallet } from '@solana/wallet-adapter-react';
import apiPost from 'utils/apiPost';
import { GameAccount, GameAccountSchema } from 'components/templates/TicTacToe/types';
import { deserializeUnchecked } from 'borsh';

// eslint-disable-next-line complexity
const GameBoard: FC<BoardInput> = ({ data, connection }) => {
  const bgColor = useColorModeValue('none', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boardBorder = useColorModeValue('gray.200', 'gray.700');
  const descBgColor = useColorModeValue('gray.100', 'gray.600');
  const boardColor = useColorModeValue('gray.100', 'gray.900');
  const playedBoxColor = useColorModeValue('gray.300', 'gray.800');
  const { publicKey } = useWallet();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [currentgameData, setCurrentGameData] = useState<GameAccount>();
  const [subscriptions, SetSubscriptions] = useState<number[]>([]);
  const [spinner, setSpinner] = useState<number | null>();

  const accountPublicKey = data.accountId;

  useEffect(() => {
    setCurrentGameData(data.gameInput);
  }, [data]);

  // Listen to account changes
  useEffect(() => {
    const SubId = connection.onAccountChange(accountPublicKey, (e) => {
      console.log('Account Updated');
      console.log(e);
      const gameInput = deserializeUnchecked(GameAccountSchema, GameAccount, e.data);
      setCurrentGameData(gameInput);
    });
    SetSubscriptions((existing) => [...existing, SubId]);
    console.log(SubId);
  }, [accountPublicKey]);

  const deleteArrayElement = (id: number) => {
    console.log('Deleting', id);
    const temp = subscriptions;
    if (temp.includes(id)) {
      temp.splice(temp.indexOf(id), 1);
      SetSubscriptions(() => [...temp]);
    }
  };
  useEffect(() => {
    console.log(subscriptions);
    if (subscriptions.length > 1) {
      connection.removeAccountChangeListener(subscriptions[0]);
      deleteArrayElement(subscriptions[0]);
    }
  }, [subscriptions]);

  const celebrateWin = (winnerId: number) => {
    switch (winnerId) {
      case 1: {
        if (currentgameData?.player1 === publicKey?.toBase58()) {
          toast({
            title: 'You won the game!! ',
            status: 'success',
            position: 'bottom-right',
            isClosable: true,
          });
        } else {
          toast({
            title: 'Player 1 won the game!! ',
            status: 'error',
            position: 'bottom-right',
            isClosable: true,
          });
        }
        break;
      }
      case 2: {
        if (currentgameData?.player2 === publicKey?.toBase58()) {
          toast({
            title: 'You won the game!! ',
            status: 'success',
            position: 'bottom-right',
            isClosable: true,
          });
        } else {
          toast({
            title: 'Player 2 won the game!! ',
            status: 'error',
            position: 'bottom-right',
            isClosable: true,
          });
        }
        break;
      }
      case 3: {
        toast({
          title: 'Its a Draw!! ',
          status: 'success',
          position: 'bottom-right',
          isClosable: true,
        });

        break;
      }
    }
  };

  useEffect(() => {
    if (currentgameData?.game_status !== 0 && currentgameData) {
      celebrateWin(currentgameData?.game_status);
    }
  }, [currentgameData]);

  // eslint-disable-next-line complexity
  async function playGame(move: number) {
    setSpinner(move);
    if (currentgameData) {
      const gamePlayer =
        currentgameData.player1 === publicKey?.toBase58()
          ? 1
          : currentgameData.player2 === publicKey?.toBase58()
          ? 2
          : 0;

      console.log(gamePlayer);
      if (gamePlayer) {
        try {
          setStatus('tx in progress..');
          const gameMove = { player1: currentgameData.player1, player2: currentgameData.player2, gamePlayer, move };
          await apiPost('/TicTacToe/playGame', gameMove);
          setStatus('');
        } catch (e) {
          if (e instanceof Error) {
            throw toast({
              title: 'Something went wrong',
              description: e.message,
              status: 'error',
              position: 'bottom-right',
              isClosable: true,
            });
          }
        }
      } else {
        throw toast({
          title: 'Invalid player for the game',
          status: 'error',
          position: 'bottom-right',
          isClosable: true,
        });
      }
    }
    setSpinner(null);
  }

  if (currentgameData) {
    return (
      <>
        <Flex
          height={'full'}
          bgColor={bgColor}
          padding={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          justifyContent={'center'}
          width={'full'}
          flexDirection={'column'}
        >
          <Grid gridTemplateColumns={'repeat(3, 1fr)'} gridTemplateRows={'repeat(3, 1fr)'} justifyContent={'center'}>
            {currentgameData.moves.map((e, i) => {
              return (
                <Flex
                  height={'clamp(100px, 15vw, 160px)'}
                  width={'clamp(100px, 15vw, 160px)'}
                  key={i}
                  backgroundColor={e === 0 ? playedBoxColor : boardColor}
                  border={'2px'}
                  borderColor={boardBorder}
                  justifyContent={'center'}
                  alignItems={'center'}
                  onClick={() => {
                    if (e === 0 && !spinner && currentgameData.game_status === 0) {
                      if (currentgameData.next_move === 1) {
                        if (currentgameData.player1 !== publicKey?.toBase58()) {
                          toast({
                            title: 'Not your turn',
                            status: 'error',
                            position: 'bottom-right',
                            isClosable: true,
                          });
                        } else {
                          console.log(i + 1);
                          playGame(i);
                        }
                      } else {
                        if (currentgameData.player2 !== publicKey?.toBase58()) {
                          toast({
                            title: 'Not your turn',
                            status: 'error',
                            position: 'bottom-right',
                            isClosable: true,
                          });
                        } else {
                          console.log(i + 1);
                          playGame(i);
                        }
                      }
                    } else if (currentgameData.game_status !== 0) {
                      celebrateWin(currentgameData.game_status);
                    } else {
                      toast({
                        title: 'Wrong Input',
                        status: 'error',
                        position: 'bottom-right',
                        isClosable: true,
                      });
                    }
                  }}
                  fontSize={'25px'}
                  color={'white'}
                  cursor={'pointer'}
                >
                  {(e === 1 && '🔴') || (e === 2 && '❌') || (e === 0 && (spinner === i ? <Spinner /> : ''))}
                </Flex>
              );
            })}
          </Grid>
          {currentgameData.player1 && currentgameData.player2 ? (
            <Box maxWidth="100%" padding={3} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
              <SimpleGrid
                columns={2}
                row={2}
                spacing={4}
                bgColor={descBgColor}
                padding={2.5}
                borderRadius="xl"
                marginTop={2}
              >
                <Box>
                  <Box as="h4" noOfLines={1} fontWeight="medium" fontSize="sm">
                    Player 1:
                  </Box>
                  <Box
                    as="h4"
                    noOfLines={1}
                    fontSize="sm"
                    color={publicKey?.toBase58() === currentgameData.player1 ? 'yellow.500' : ''}
                  >
                    {currentgameData.player1 ? getEllipsisTxt(currentgameData.player1) : <>n/a</>}
                  </Box>
                </Box>
                <Box>
                  <Box as="h4" noOfLines={1} fontSize="sm">
                    Player 2:
                  </Box>
                  <Box
                    as="h4"
                    noOfLines={1}
                    fontSize="sm"
                    color={publicKey?.toBase58() === currentgameData.player2 ? 'yellow.500' : ''}
                  >
                    {currentgameData.player2 ? getEllipsisTxt(currentgameData.player2) : <>n/a</>}
                  </Box>
                </Box>
                <Box>
                  <Box as="h4" noOfLines={1} fontSize="sm">
                    Status:
                  </Box>
                  <Box as="h4" noOfLines={1} fontSize="sm" color={'green.500'} fontWeight={'bold'}>
                    {currentgameData.game_status
                      ? currentgameData.game_status !== 3
                        ? `Player ${currentgameData.game_status} Won`
                        : 'Its a Draw!!'
                      : status
                      ? status
                      : currentgameData.next_move
                      ? `Next turn: Player ${currentgameData.next_move}`
                      : 'Data Unavailable'}
                  </Box>
                </Box>
              </SimpleGrid>
            </Box>
          ) : (
            <></>
          )}
        </Flex>
      </>
    );
  }
  return null;
};

export default GameBoard;
