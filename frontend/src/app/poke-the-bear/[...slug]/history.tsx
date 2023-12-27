'use client';
import PageSelector from '@/app/components/navigation/page-selector';
import { formatTokenAmount } from '@/app/utils';
import { ptbSubgraphAPI } from '@/common/api';
import { CaveCurrency } from '@/common/enums';
import { CheckCircleIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Flex,
  Heading,
  Image,
  Link,
  Skeleton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function RoundsPlayedHistory({
  addresses,
}: {
  addresses: string[];
}) {
  const lcAddresses = addresses.map((address) => address.toLowerCase());
  const [page, setPage] = useState(0);
  let [roundsPlayed, setRoundsPlayed] = useState([] as Round[]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    ptbSubgraphAPI.getPlayersRounds(addresses, page, 10).then((rounds) => {
      setRoundsPlayed(rounds);
      setIsLoading(false);
    });
  }, [page]);

  const tableHead = (
    <>
      <TableCaption placement="top">
        <Heading>Rounds Played History</Heading>
      </TableCaption>
      <Thead>
        <Tr>
          <Th width="3%">Cave ID</Th>
          <Th width="3%">Round ID</Th>
          <Th minWidth="200px" width="20%">
            Loser
          </Th>
          <Th width="10%">Players</Th>
          <Th width="10%">Wager</Th>
          <Th width="10%">PnL</Th>
          <Th width="3%" textAlign="center">
            Link
          </Th>
        </Tr>
      </Thead>
    </>
  );

  return (
    <TableContainer>
      <Table display={isLoading ? '' : 'none'} variant="simple" size={'sm'}>
        {tableHead}
      </Table>
      <Skeleton
        display={isLoading ? '' : 'none'}
        height="410px"
        isLoaded={!isLoading}
        width="100%"
      ></Skeleton>
      <Table display={isLoading ? 'none' : ''} variant="simple" size={'sm'}>
        {tableHead}
        <Tbody>
          {roundsPlayed.map((round) => {
            const tokenDecimals = round.currency === CaveCurrency.ETH ? 2 : 0;

            const winStyle = {
              color: 'var(--chakra-colors-green-500)',
            };
            const lossStyle = {
              color: 'var(--chakra-colors-red-500)',
            };

            const isLoser = lcAddresses.includes(round.loser.address);

            /// How many of the participating addresses is the current player
            const participants = round.players
              .map((player) => player.address)
              .reduce((acc, playerAddress) => {
                if (lcAddresses.includes(playerAddress)) {
                  acc++;
                }

                return acc;
              }, 0);

            const losses =
              (round.caveEnterAmount + round.cavePrizeAmount) * BigInt(-1);
            const profits = round.cavePrizeAmount * BigInt(participants);
            const pnl = isLoser ? losses + profits : profits;
            const roundLink = `https://looksrare.org/poke-the-bear/cave/${round.caveId}/${round.id}`;

            return (
              <Tr key={`${round.caveId}-${round.id}`}>
                <Td>{round.caveId}</Td>
                <Td>{round.id}</Td>
                <Td
                  maxWidth="400px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {isLoser ? (
                    <div style={lossStyle}>
                      {round.loser.ensName
                        ? round.loser.ensName
                        : round.loser.address}
                    </div>
                  ) : (
                    <Link href={`/poke-the-bear/${round.loser.address}`}>
                      {round.loser.ensName
                        ? round.loser.ensName
                        : round.loser.address}
                    </Link>
                  )}
                </Td>
                <Td fontSize="16px">
                  {round.players.map((player) => {
                    const isCurrentAddress = lcAddresses.includes(
                      player.address
                    );
                    return (
                      <Link
                        style={{
                          cursor: isCurrentAddress ? 'default' : 'pointer',
                        }}
                        href={
                          isCurrentAddress
                            ? undefined
                            : `/poke-the-bear/${player.address}`
                        }
                      >
                        <Tooltip
                          label={
                            player.ensName ? player.ensName : player.address
                          }
                        >
                          {player.address === round.loser.address ? (
                            <CloseIcon
                              marginRight="3px"
                              color={isCurrentAddress ? 'red' : 'gray'}
                            />
                          ) : (
                            <CheckCircleIcon
                              marginRight="3px"
                              color={isCurrentAddress ? 'green' : 'gray'}
                            />
                          )}
                        </Tooltip>
                      </Link>
                    );
                  })}
                </Td>
                <Td textAlign="right">
                  <Flex alignItems="center">
                    <Image
                      src={
                        round.currency === CaveCurrency.ETH
                          ? '/ethereum.webp'
                          : '/looks.webp'
                      }
                      width={6}
                      marginRight="10px"
                    />
                    <div>
                      {formatTokenAmount(
                        round.caveEnterAmount * BigInt(participants),
                        tokenDecimals
                      )}
                    </div>
                  </Flex>
                </Td>
                <Td textAlign="right">
                  <Flex alignItems="center">
                    <Image
                      src={
                        round.currency === CaveCurrency.ETH
                          ? '/ethereum.webp'
                          : '/looks.webp'
                      }
                      width={6}
                      marginRight="10px"
                    />
                    <div style={isLoser ? lossStyle : winStyle}>
                      {formatTokenAmount(pnl, tokenDecimals)}
                    </div>
                  </Flex>
                </Td>
                <Td textAlign="center">
                  <Link href={roundLink} isExternal={true}>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <PageSelector
        pageChangedHandler={setPage}
        isDisabled={isLoading}
        isLastPage={roundsPlayed.length !== 10}
      />
    </TableContainer>
  );
}
