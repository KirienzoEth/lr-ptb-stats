import { ptbSubgraphAPI } from '@/common/api';
import './addresses-data.scss';
import GeneralStats from './general-stats';
import OverTimeStats from './over-time-stats';

export default async function AddressesData({
  addresses,
}: {
  addresses: string[];
}) {
  const players = await ptbSubgraphAPI.getPlayers(addresses);
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

  return (
    <>
      <GeneralStats player={cumulatedPlayersData} />
      <OverTimeStats addresses={addresses} />
    </>
  );
}
