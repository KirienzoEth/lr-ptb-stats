'use client';
import { ptbSubgraphAPI } from '@/common/api';
import LineGraph from '@/app/components/data-viz/line-graph';
import BarGraph from '@/app/components/data-viz/bar-graph';
import { useEffect, useState } from 'react';
import { Serie } from '@nivo/line';
import { formatEther } from 'viem';
import { Flex, Heading } from '@chakra-ui/react';
import { BarDatum } from '@nivo/bar';
import './page.scss';
import './over-time-stats.scss';
import { getNetwork } from '@/app/utils';

function formatPlayerName(address: string, ensName?: string): string {
  return ensName?.slice(0, 12) ?? address.slice(0, 10);
}

function getCumulativeUSDPNLData(playersDailyData: PlayerDailyData[]): Serie[] {
  const addressToIndex: { [key: string]: number } = {};
  return playersDailyData.reduce((acc, playerDailyData) => {
    let addressIndex = addressToIndex[playerDailyData.playerAddress];
    if (addressIndex === undefined) {
      addressToIndex[playerDailyData.playerAddress] = acc.length;
      addressIndex = addressToIndex[playerDailyData.playerAddress];
      acc[addressIndex] = {
        id: formatPlayerName(
          playerDailyData.playerAddress,
          playerDailyData.playerName
        ),
        data: [],
      };
    }

    // Push data for the current date
    acc[addressIndex].data.push({
      x: +playerDailyData.timestamp.toString(),
      y: +formatEther(playerDailyData.cumulatedUsdPnL),
    });

    return acc;
  }, [] as Serie[]);
}

function getDailyUSDPNLData(playersDailyData: PlayerDailyData[]): BarDatum[] {
  return playersDailyData.reduce((acc, playerDailyData) => {
    const date = new Date(+playerDailyData.timestamp.toString() * 1000);
    const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
    let dataForDate = acc[acc.length - 1];
    if (!dataForDate || dataForDate.date !== formattedDate) {
      dataForDate = {
        date: formattedDate,
      };
    } else {
      acc.pop();
    }

    const playerName = formatPlayerName(
      playerDailyData.playerAddress,
      playerDailyData.playerName
    );
    dataForDate[playerName] = +formatEther(playerDailyData.usdPnL);

    acc.push(dataForDate);

    return acc;
  }, [] as BarDatum[]);
}

function getPlayerNames(playersDailyData: PlayerDailyData[]): string[] {
  const set = new Set<string>();
  playersDailyData.forEach((playerDailyData) => {
    set.add(
      formatPlayerName(
        playerDailyData.playerAddress,
        playerDailyData.playerName
      )
    );
  });

  return Array.from(set);
}

export default function OverTimeStats({ addresses }: { addresses: string[] }) {
  const network = getNetwork();
  let [playersDailyData, setPlayersDailyData] = useState(
    [] as PlayerDailyData[]
  );
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    // 31 days ago
    const from = Math.floor((new Date().getTime() - 86400000 * 31) / 1000);
    ptbSubgraphAPI
      .getPlayersDailyData(network, addresses, from)
      .then((playerDailyData) => {
        setPlayersDailyData(playerDailyData);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <Heading textAlign="center">Activity in the last 30 days</Heading>
      <Flex minHeight="500px" minWidth="300px" width="100%" wrap="wrap">
        <div className="graph-container">
          <LineGraph data={getCumulativeUSDPNLData(playersDailyData)} />
        </div>
        <div className="graph-container">
          <BarGraph
            data={getDailyUSDPNLData(playersDailyData)}
            keys={getPlayerNames(playersDailyData)}
            index="date"
          />
        </div>
      </Flex>
    </>
  );
}
