'use client';
import FindPlayer from './find-player';
import GeneralStats from './general-stats';
import TopPlayersTable from './top-players-table';

export default function Page() {
  return (
    <>
      <GeneralStats />
      <TopPlayersTable />
      <FindPlayer />
    </>
  );
}
