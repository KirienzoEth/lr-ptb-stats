'use client';
import GeneralStats from './general-stats';
import TopPlayersTable from './top-players-table';

export default async function Page() {
  return (
    <>
      <GeneralStats />
      <div style={{ margin: '20px 50px' }}>
        <TopPlayersTable />
      </div>
    </>
  );
}
