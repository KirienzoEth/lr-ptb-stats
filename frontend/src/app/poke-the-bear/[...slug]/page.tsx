import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { isAddress } from 'viem';
import OverTimeStats from './over-time-stats';
import GeneralStats from './general-stats';
import RoundsPlayedHistory from './history';

export default function Page({ params }: { params: { slug: string[] } }) {
  const addresses = [...new Set(params.slug)];
  const errorAddresses = addresses
    .map((address) => address.toLowerCase())
    .filter((address) => !isAddress(address));

  return (
    <>
      {errorAddresses.length !== 0 ? (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid address(es):</AlertTitle>
          <AlertDescription>{errorAddresses.join(', ')}</AlertDescription>
        </Alert>
      ) : (
        <div style={{ height: '100vh', width: '100%' }}>
          <GeneralStats addresses={addresses} />
          <OverTimeStats addresses={addresses} />
          <RoundsPlayedHistory addresses={addresses} />
        </div>
      )}
    </>
  );
}
