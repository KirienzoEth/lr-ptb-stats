'use client';
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
  Flex,
  Link,
  Skeleton,
  IconButton,
  Heading,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';
import { formatTokenAmount } from '../utils';
import { useEffect, useState } from 'react';
import PageSelector from '../components/navigation/page-selector';

export default function Page() {
  let [topPlayers, setTopPlayers] = useState([] as Player[]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    ptbSubgraphAPI.getTopPlayers(10, page).then((players) => {
      setTopPlayers(players);
      setIsLoading(false);
    });
  }, [page]);

  const winStyle = {
    color: 'var(--chakra-colors-green-500)',
  };
  const lossStyle = {
    color: 'var(--chakra-colors-red-500)',
  };

  const tableHead = (
    <>
      <TableCaption placement="top">
        <Heading>Top users by USD wagered</Heading>
      </TableCaption>
      <Thead>
        <Tr>
          <Th width="3%">#</Th>
          <Th minWidth="420px" width="30%">
            Address
          </Th>
          <Th width="10%">USD Wagered</Th>
          <Th width="10%">Looks wagered</Th>
          <Th width="10%">ETH wagered</Th>
          <Th width="10%">Gas paid</Th>
          <Th width="5%" textAlign="right">
            Rounds played
          </Th>
          <Th width="10%" textAlign="right">
            PnL
          </Th>
          <Th minWidth="100px" width="5%"></Th>
        </Tr>
      </Thead>
    </>
  );

  return (
    <TableContainer margin="0 50px">
      <Table display={isLoading ? '' : 'none'} variant="simple" size={'sm'}>
        {tableHead}
      </Table>
      <Skeleton
        display={isLoading ? '' : 'none'}
        height="650px"
        isLoaded={!isLoading}
        width="100%"
      ></Skeleton>
      <Table display={isLoading ? 'none' : ''} variant="simple" size={'sm'}>
        {tableHead}
        <Tbody>
          {topPlayers.map((player, index) => (
            <Tr key={player.address}>
              <Td>{index + 1 + page * 10}</Td>
              <Td
                maxWidth="400px"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                {player.ensName ? player.ensName : player.address}
              </Td>
              <Td>${formatTokenAmount(player.usdWagered)}</Td>
              <Td textAlign="right">
                <Flex alignItems="center">
                  <Image src="/looks.webp" width={6} marginRight="10px" />
                  {player.looksWagered === BigInt(0) ? (
                    0
                  ) : (
                    <div>
                      <div>{formatTokenAmount(player.looksWagered, 0)}</div>
                      <div style={winStyle}>
                        +{formatTokenAmount(player.looksWon, 0)}
                      </div>
                      <div style={lossStyle}>
                        -{formatTokenAmount(player.looksLost, 0)}
                      </div>
                    </div>
                  )}
                </Flex>
              </Td>
              <Td textAlign="right">
                <Flex alignItems="center">
                  <Image src="/ethereum.webp" width={6} />

                  {player.ethWagered === BigInt(0) ? (
                    0
                  ) : (
                    <div>
                      <div>{formatTokenAmount(player.ethWagered, 2)}</div>
                      <div style={winStyle}>
                        +{formatTokenAmount(player.ethWon, 2)}
                      </div>
                      <div style={lossStyle}>
                        -{formatTokenAmount(player.ethLost, 2)}
                      </div>
                    </div>
                  )}
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
                color={
                  player.usdPnL - player.feesPaidInUSD < 0
                    ? 'red.500'
                    : 'green.500'
                }
              >
                ${formatTokenAmount(player.usdPnL - player.feesPaidInUSD)}
              </Td>
              <Td>
                <Flex justifyContent="center">
                  <Link
                    target="_blank"
                    href={`https://etherscan.io/advanced-filter?tadd=0x00000000009f22b55d3105e5cff7d1a6503cf3ce&fadd=${player.address}&qt=1`}
                  >
                    <Image width="20px" src="/etherscan-logo-circle.svg" />
                  </Link>
                  <Link href={`/poke-the-bear/${player.address}`}>
                    <SearchIcon width="2.5em" />
                  </Link>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <PageSelector isDisabled={isLoading} pageChangedHandler={setPage} />
    </TableContainer>
  );
}
