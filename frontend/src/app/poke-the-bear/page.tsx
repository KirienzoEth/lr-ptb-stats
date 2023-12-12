import { Container } from '@chakra-ui/react';
import TopPlayersTable from './top-players-table';

export default async function Page() {
  return (
    <>
      <Container>Top players of the PTB by USD volume wagered.</Container>
      <div style={{ margin: '50px 50px' }}>
        <TopPlayersTable />
      </div>
    </>
  );
}
