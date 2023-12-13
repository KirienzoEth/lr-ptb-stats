import { ptbSubgraphAPI } from '@/common/api';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Image,
  Grid,
  GridItem,
  Flex,
} from '@chakra-ui/react';
import { formatEther } from 'viem';

function formatTokenAmount(amount: bigint, fractionDigits = 2) {
  return (+formatEther(amount)).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export default async function Page() {
  const topPlayers = await ptbSubgraphAPI.getPlayers();

  const winStyle = {
    color: 'var(--chakra-colors-green-500)',
  };
  const lossStyle = {
    color: 'var(--chakra-colors-red-500)',
  };

  return (
    <TableContainer>
      <Table variant="simple" size={'sm'}>
        <TableCaption>Top 20 users by USD wagered</TableCaption>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>USD Wagered</Th>
            <Th>Looks wagered</Th>
            <Th>ETH wagered</Th>
            <Th>Gas paid</Th>
            <Th>Rounds played</Th>
            <Th>PnL</Th>
          </Tr>
        </Thead>
        <Tbody>
          {topPlayers.map((player) => (
            <Tr key={player.address}>
              <Td>{player.address}</Td>
              <Td>${formatTokenAmount(player.usdWagered)}</Td>
              <Td textAlign="right">
                <Flex alignItems="center">
                  <Image src="/looks.webp" width={6} marginRight="10px" />
                  <div>
                    <div>{formatTokenAmount(player.looksWagered, 0)}</div>
                    <div style={winStyle}>
                      +{formatTokenAmount(player.looksWon, 0)}
                    </div>
                    <div style={lossStyle}>
                      -{formatTokenAmount(player.looksLost, 0)}
                    </div>
                  </div>
                </Flex>
              </Td>
              <Td textAlign="right">
                <Flex alignItems="center">
                  <Image src="/ethereum.webp" width={6} />
                  <div>
                    <div>{formatTokenAmount(player.ethWagered, 2)}</div>
                    <div style={winStyle}>
                      +{formatTokenAmount(player.ethWon, 2)}
                    </div>
                    <div style={lossStyle}>
                      -{formatTokenAmount(player.ethLost, 2)}
                    </div>
                  </div>
                </Flex>
              </Td>
              <Td textAlign="left">
                <Flex alignItems="center">
                  <Image src="/ethereum.webp" width={6} />
                  <div style={lossStyle}>
                    -{formatTokenAmount(player.feesPaidInETH, 2)}
                  </div>
                </Flex>
                <div style={lossStyle}>
                  -${formatTokenAmount(player.feesPaidInUSD, 2)}
                </div>
              </Td>
              <Td textAlign="right">
                <div>
                  <div>{+player.roundsEnteredCount.toLocaleString()}</div>
                  <div style={winStyle}>
                    W: {+player.roundsWonCount.toLocaleString()}
                  </div>
                  <div style={lossStyle}>
                    L: {+player.roundsLostCount.toLocaleString()}
                  </div>
                </div>
              </Td>
              <Td
                textAlign="right"
                fontWeight="bold"
                color={player.usdPnL < 0 ? 'red.500' : 'green.500'}
              >
                ${formatTokenAmount(player.usdPnL - player.feesPaidInUSD)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
