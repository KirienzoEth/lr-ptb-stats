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
  Link,
  Spinner,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { isAddress } from 'viem';

export default function FindPlayer() {
  const [inputValue, setInputValue] = useState('');
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (event: any) => setInputValue(event.target.value);
  const handleConfirm = (event: any) => {
    const isValid = isAddress(inputValue);
    setIsInvalidAddress(!isValid);
    console.log(inputValue, isValid);
    if (isValid) {
      setIsLoading(true);
      return true;
    }

    event.preventDefault();
  };

  return (
    <Container textAlign="center" width="100%" margin="10px auto">
      <Heading margin="10px">Find a player</Heading>
      <Flex alignItems="center" margin="10px" width="100%">
        <Input
          placeholder="Player Address"
          size="lg"
          onChange={handleChange}
          isInvalid={isInvalidAddress}
          errorBorderColor="crimson"
        />
        <Link
          onClick={handleConfirm}
          as={NextLink}
          href={`/poke-the-bear/${inputValue}`}
        >
          <Button disabled={isLoading} size="lg">
            {isLoading ? (
              <Spinner color="#0ce466" />
            ) : (
              <Search2Icon color="#0ce466" />
            )}
          </Button>
        </Link>
      </Flex>
      {isInvalidAddress ? (
        <Alert status="error" margin="10px">
          <AlertIcon />
          <AlertTitle>This is not a valid ethereum address!</AlertTitle>
        </Alert>
      ) : (
        <></>
      )}
    </Container>
  );
}
