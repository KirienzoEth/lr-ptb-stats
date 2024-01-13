import { getNetwork } from '@/app/utils';
import { getAddressFromEnsName } from '@/common/ens-resolver';
import { Search2Icon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isAddress } from 'viem';

export default function FindPlayer() {
  const network = getNetwork();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (event: any) => setInputValue(event.target.value);
  const handleConfirm = async (event: any) => {
    setIsLoading(true);
    setIsInvalidAddress(false);
    const isValidAddress = isAddress(inputValue);
    if (isValidAddress) {
      router.push(`/poke-the-bear/${network}/${inputValue}`);
      return true;
    }

    if (inputValue.slice(-4) === '.eth') {
      const address = await getAddressFromEnsName(inputValue);
      if (address) {
        router.push(`/poke-the-bear/${network}/${address}`);
        return true;
      }
    }

    setIsInvalidAddress(true);
    setIsLoading(false);
  };

  return (
    <Container textAlign="center" width="100%" margin="10px auto">
      <Heading margin="10px">Find a player</Heading>
      <Flex alignItems="center" margin="10px" width="100%">
        <Input
          placeholder="Player Address / ENS"
          size="lg"
          onChange={handleChange}
          isInvalid={isInvalidAddress}
          errorBorderColor="crimson"
        />
        <Button disabled={isLoading} size="lg" onClick={handleConfirm}>
          {isLoading ? (
            <Spinner color="#0ce466" />
          ) : (
            <Search2Icon color="#0ce466" />
          )}
        </Button>
      </Flex>
      {isInvalidAddress ? (
        <Alert status="error" margin="10px">
          <AlertIcon />
          <AlertTitle>
            This is not a valid ethereum address or ens name!
          </AlertTitle>
        </Alert>
      ) : (
        <></>
      )}
    </Container>
  );
}
