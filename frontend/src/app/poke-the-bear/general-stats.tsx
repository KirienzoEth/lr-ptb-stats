'use client';
import { ptbSubgraphAPI } from '@/common/api';
import {
  Container,
  Divider,
  Heading,
  Image,
  Skeleton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { formatTokenAmount } from '../utils';
import './general-stats.scss';

export default function GeneralStats() {
  let [gameData, setGameData] = useState({} as Game);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    isLoading ?? setIsLoading(true);
    ptbSubgraphAPI.getPTBGame().then((gameData) => {
      setGameData(gameData);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <Container textAlign="center">
        <Heading>Protocol activity and earnings</Heading>
      </Container>
      <Skeleton isLoaded={!isLoading}>
        <StatGroup>
          <Stat>
            <StatLabel>
              <Image className="currency-logo" src="/ptb-logo.webp" />
              Rounds Played
            </StatLabel>
            <StatNumber>
              {gameData.roundsPlayed?.toLocaleString(undefined)}
            </StatNumber>
          </Stat>
          <Divider orientation="vertical" height="110px" margin="10px 0" />
          <Stat>
            <StatLabel>📈 USD Volume</StatLabel>
            <StatNumber>
              ${formatTokenAmount(gameData.usdVolume ?? 0, 0)}
            </StatNumber>
          </Stat>
          <Divider orientation="vertical" height="110px" margin="10px 0" />
          <Stat>
            <StatLabel>
              <Image className="currency-logo" src="/looks.webp" />
              Looks earned
            </StatLabel>
            <StatNumber>
              {formatTokenAmount(gameData.looksEarned ?? 0, 0)}
            </StatNumber>
          </Stat>
          <Divider orientation="vertical" height="110px" margin="10px 0" />
          <Stat>
            <StatLabel>
              <Image className="currency-logo" src="/ethereum.webp" />
              ETH earned
            </StatLabel>
            <StatNumber>
              {formatTokenAmount(gameData.ethEarned ?? 0)}
            </StatNumber>
          </Stat>
          <Divider orientation="vertical" height="110px" margin="10px 0" />
          <Stat>
            <StatLabel>💰 USD Earned</StatLabel>
            <StatNumber>
              {formatTokenAmount(gameData.usdEarned ?? 0, 0)}
            </StatNumber>
          </Stat>
        </StatGroup>
      </Skeleton>
    </>
  );
}
