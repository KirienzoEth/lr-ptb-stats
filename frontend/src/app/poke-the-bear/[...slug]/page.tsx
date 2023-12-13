import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { isAddress } from 'viem';
import AddressesData from './addresses-data';

export default async function Page({ params }: { params: { slug: string[] } }) {
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
        <AddressesData addresses={addresses} />
      )}
    </>
  );
}
