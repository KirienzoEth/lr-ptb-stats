'use client';
import { formatTokenAmount } from '@/app/utils';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Image,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ptbSubgraphAPI } from '@/common/api';
import './page.scss';

export default function GeneralStats({ addresses }: { addresses: string[] }) {
  let [playerPnLWithGas, setPlayerPnLWithGas] = useState(BigInt(0));
  let [playerData, setPlayerData] = useState({} as Player);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    ptbSubgraphAPI.getPlayers(addresses).then((players) => {
      const cumulatedPlayersData = players[0];
      for (let i = 1; i < players.length; i++) {
        const additionalPlayer = players[i];
        for (let [key, value] of Object.entries(additionalPlayer)) {
          if (['number', 'bigint'].includes(typeof value)) {
            (cumulatedPlayersData[
              key as keyof typeof cumulatedPlayersData
            ] as bigint) += value as bigint;
          }
        }
      }

      setPlayerData(cumulatedPlayersData);
      setPlayerPnLWithGas(
        cumulatedPlayersData.usdPnL - cumulatedPlayersData.feesPaidInUSD
      );
      setIsLoading(false);
    });
  }, []);

  return (
    <StatGroup className="player-stats">
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/ptb-logo.webp" />
          Rounds Played
        </StatLabel>
        <StatNumber>
          {playerData.roundsEnteredCount?.toLocaleString(undefined)}
        </StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {playerData.roundsWonCount?.toLocaleString(undefined)}
          <span> </span>
          <StatArrow type="decrease" />
          {playerData.roundsLostCount?.toLocaleString(undefined)}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>📈 USD Volume</StatLabel>
        <StatNumber>
          ${formatTokenAmount(playerData.usdWagered ?? 0)}
        </StatNumber>
      </Stat>
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/looks.webp" />
          Looks
        </StatLabel>
        <StatNumber>
          {formatTokenAmount(playerData.looksWagered ?? 0, 0)}
        </StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {formatTokenAmount(playerData.looksWon ?? 0, 0)}
          <span> </span>
          <StatArrow type="decrease" />
          {formatTokenAmount(playerData.looksLost ?? 0, 0)}
          <div></div>
          <span
            style={{
              color:
                playerData.looksWon - playerData.looksLost > 0
                  ? 'var(--chakra-colors-green-500)'
                  : 'var(--chakra-colors-red-500)',
              fontWeight: 'bold',
            }}
          >
            = {formatTokenAmount(playerData.looksWon - playerData.looksLost, 0)}
          </span>
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/ethereum.webp" />
          ETH
        </StatLabel>
        <StatNumber>{formatTokenAmount(playerData.ethWagered ?? 0)}</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {formatTokenAmount(playerData.ethWon ?? 0)}
          <span> </span>
          <StatArrow type="decrease" />
          {formatTokenAmount(playerData.ethLost ?? 0)}
          <div></div>
          <span
            style={{
              color:
                playerData.ethWon - playerData.ethLost > 0
                  ? 'var(--chakra-colors-green-500)'
                  : 'var(--chakra-colors-red-500)',
              fontWeight: 'bold',
            }}
          >
            = {formatTokenAmount(playerData.ethWon - playerData.ethLost)}
          </span>
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>💸 Gas fees</StatLabel>
        <StatNumber>
          <StatArrow type="decrease" />
          {formatTokenAmount(playerData.feesPaidInETH ?? 0)}
          <Image width="7" className="currency-logo" src="/ethereum.webp" />
        </StatNumber>
        <StatHelpText>
          <StatArrow type="decrease" />$
          {formatTokenAmount(playerData.feesPaidInUSD ?? 0)}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>💰 PnL</StatLabel>
        <StatNumber>
          <StatArrow type={playerPnLWithGas > 0 ? 'increase' : 'decrease'} />
          <span className={playerPnLWithGas > 0 ? 'profit' : 'loss'}>
            ${formatTokenAmount(playerPnLWithGas ?? 0)}
          </span>
        </StatNumber>
        <StatHelpText>
          <StatArrow type={playerData.usdPnL > 0 ? 'increase' : 'decrease'} />
          without gas fees:{' '}
          <span className={playerData.usdPnL > 0 ? 'profit' : 'loss'}>
            ${formatTokenAmount(playerData.usdPnL ?? 0)}
          </span>
        </StatHelpText>
      </Stat>
    </StatGroup>
  );
}
