import { Box, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { FC } from 'react';
import { GameInput } from './types';
import { getEllipsisTxt } from '../../../utils/format';
import { useWallet } from '@solana/wallet-adapter-react';

const Games: FC<GameInput> = ({ data, loadGame }) => {
  const bgColor = useColorModeValue('none', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const descBgColor = useColorModeValue('gray.100', 'gray.600');

  const { player1, player2 } = data.gameInput;
  const { publicKey } = useWallet();

  if (player1 && player2) {
    return (
      <>
        <Box
          maxWidth="300px"
          bgColor={bgColor}
          padding={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          onClick={loadGame}
          cursor={'pointer'}
        >
          <Box maxHeight="260px" minWidth={'300px'} borderRadius="xl"></Box>
          <SimpleGrid columns={2} spacing={4} bgColor={descBgColor} padding={2.5} borderRadius="xl" marginTop={2}>
            <Box>
              <Box as="h4" noOfLines={1} fontWeight="medium" fontSize="sm">
                Player 1:
              </Box>
              <Box as="h4" noOfLines={1} fontSize="sm" color={publicKey?.toBase58() === player1 ? 'yellow.500' : ''}>
                {player1 ? getEllipsisTxt(player1) : <>n/a</>}
              </Box>
            </Box>
            <Box>
              <Box as="h4" noOfLines={1} fontSize="sm">
                Player 2:
              </Box>
              <Box as="h4" noOfLines={1} fontSize="sm" color={publicKey?.toBase58() === player2 ? 'yellow.500' : ''}>
                {player2 ? getEllipsisTxt(player2) : <>n/a</>}
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      </>
    );
  }
  return null;
};

export default Games;
