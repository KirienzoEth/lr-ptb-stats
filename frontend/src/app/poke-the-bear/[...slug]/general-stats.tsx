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
import './addresses-data.scss';

export default function GeneralStats({ player }: { player: Player }) {
  const playerPnLWithGas = player.usdPnL - player.feesPaidInUSD;

  return (
    <StatGroup>
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/ptb-logo.webp" />
          Rounds Played
        </StatLabel>
        <StatNumber>
          {player.roundsEnteredCount.toLocaleString(undefined)}
        </StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {player.roundsWonCount.toLocaleString(undefined)}
          <span> </span>
          <StatArrow type="decrease" />
          {player.roundsLostCount.toLocaleString(undefined)}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>📈 USD Volume</StatLabel>
        <StatNumber>${formatTokenAmount(player.usdWagered)}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/looks.webp" />
          Looks
        </StatLabel>
        <StatNumber>{formatTokenAmount(player.looksWagered, 0)}</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {formatTokenAmount(player.looksWon, 0)}
          <span> </span>
          <StatArrow type="decrease" />
          {formatTokenAmount(player.looksLost, 0)}
          <div></div>
          <span
            style={{
              color:
                player.looksWon - player.looksLost > 0
                  ? 'var(--chakra-colors-green-500)'
                  : 'var(--chakra-colors-red-500)',
              fontWeight: 'bold',
            }}
          >
            = {formatTokenAmount(player.looksWon - player.looksLost, 0)}
          </span>
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>
          <Image className="currency-logo" src="/ethereum.webp" />
          ETH
        </StatLabel>
        <StatNumber>{formatTokenAmount(player.ethWagered)}</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          {formatTokenAmount(player.ethWon)}
          <span> </span>
          <StatArrow type="decrease" />
          {formatTokenAmount(player.ethLost)}
          <div></div>
          <span
            style={{
              color:
                player.ethWon - player.ethLost > 0
                  ? 'var(--chakra-colors-green-500)'
                  : 'var(--chakra-colors-red-500)',
              fontWeight: 'bold',
            }}
          >
            = {formatTokenAmount(player.ethWon - player.ethLost)}
          </span>
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>💸 Gas fees</StatLabel>
        <StatNumber>
          <StatArrow type="decrease" />
          {formatTokenAmount(player.feesPaidInETH)}
          <Image width="7" className="currency-logo" src="/ethereum.webp" />
        </StatNumber>
        <StatHelpText>
          <StatArrow type="decrease" />$
          {formatTokenAmount(player.feesPaidInUSD)}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>💰 PnL</StatLabel>
        <StatNumber>
          <StatArrow type={playerPnLWithGas > 0 ? 'increase' : 'decrease'} />
          <span className={playerPnLWithGas > 0 ? 'profit' : 'loss'}>
            ${formatTokenAmount(playerPnLWithGas)}
          </span>
        </StatNumber>
        <StatHelpText>
          <StatArrow type={player.usdPnL > 0 ? 'increase' : 'decrease'} />
          without gas fees:{' '}
          <span className={player.usdPnL > 0 ? 'profit' : 'loss'}>
            ${formatTokenAmount(player.usdPnL)}
          </span>
        </StatHelpText>
      </Stat>
    </StatGroup>
  );
}
