'use client';
import { ptbSubgraphAPI } from '@/common/api';
import LineGraph from '@/app/components/data-viz/line-graph';
import BarGraph from '@/app/components/data-viz/bar-graph';
import './addresses-data.scss';
import { useEffect, useState } from 'react';
import { Serie } from '@nivo/line';
import { formatEther } from 'viem';
import { Flex } from '@chakra-ui/react';
import { BarDatum } from '@nivo/bar';

function formatPlayerName(address: string, ensName?: string): string {
  return ensName?.slice(0, 12) ?? address.slice(0, 10);
}

function getCumulativeUSDPNLData(playersDailyData: PlayerDailyData[]): Serie[] {
  const addressToIndex: { [key: string]: number } = {};
  return playersDailyData.reduce((acc, playerDailyData) => {
    let addressIndex = addressToIndex[playerDailyData.playerAddress];
    const date = new Date(+playerDailyData.timestamp.toString() * 1000);
    const previousDay = new Date();
    previousDay.setDate(date.getDate() - 1);
    const formattedPreviousDay = `${previousDay.getUTCFullYear()}-${
      previousDay.getUTCMonth() + 1
    }-${previousDay.getUTCDate()}`;
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

    // Fill holes in the data
    if (
      acc[addressIndex].data[acc[addressIndex].data.length - 1] &&
      acc[addressIndex].data[acc[addressIndex].data.length - 1].x !==
        formattedPreviousDay
    ) {
      acc[addressIndex].data.push({
        x: formattedPreviousDay,
        y: acc[addressIndex].data[acc[addressIndex].data.length - 1].y,
      });
    }

    // Push data for the current date
    acc[addressIndex].data.push({
      x: `${date.getUTCFullYear()}-${
        date.getUTCMonth() + 1
      }-${date.getUTCDate()}`,
      y: +formatEther(playerDailyData.cumulatedUsdPnL),
    });

    return acc;
  }, [] as Serie[]);
}

function getDailyUSDPNLData(playersDailyData: PlayerDailyData[]): BarDatum[] {
  return playersDailyData.reduce((acc, playerDailyData) => {
    const date = new Date(+playerDailyData.timestamp.toString() * 1000);
    const formattedDate = `${date.getUTCFullYear()}-${
      date.getUTCMonth() + 1
    }-${date.getUTCDate()}`;
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
  let [playersDailyData, setPlayersDailyData] = useState(
    [] as PlayerDailyData[]
  );
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    // 31 days ago
    const from = Math.floor((new Date().getTime() - 86400000 * 31) / 1000);
    ptbSubgraphAPI
      .getPlayersDailyData(addresses, from)
      .then((playerDailyData) => {
        setPlayersDailyData(playerDailyData);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <Flex height="500px">
        <LineGraph data={getCumulativeUSDPNLData(playersDailyData)} />
        <BarGraph
          data={getDailyUSDPNLData(playersDailyData)}
          keys={getPlayerNames(playersDailyData)}
          index="date"
        />
      </Flex>
    </>
  );
}
