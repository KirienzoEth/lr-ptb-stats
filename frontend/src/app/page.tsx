'use client';
import { Card, CardBody, Image, Heading, Link, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Page() {
  return (
    <Flex
      height="100vh"
      width="100%"
      gap="3%"
      alignItems="center"
      justifyContent="center"
    >
      <Link _hover="" textDecoration="none" as={NextLink} href="/poke-the-bear">
        <Card width="400px" height="400px" maxW="sm" padding="20px">
          <CardBody textAlign="center">
            <Image margin="auto" height="280px" src="/ptb-logo.webp" />
            <Heading marginTop="20px">Poke The Bear</Heading>
          </CardBody>
        </Card>
      </Link>
      <Link _hover="" textDecoration="none" as={NextLink} href="#">
        <Card width="400px" height="400px" maxW="sm" padding="20px">
          <CardBody textAlign="center">
            <Image
              filter="grayscale(100%)"
              margin="auto"
              height="280px"
              transform="rotate(270deg)"
              src="/yolo-logo.svg"
            />
            <Heading marginTop="20px">YOLO (soon)</Heading>
          </CardBody>
        </Card>
      </Link>
    </Flex>
  );
}
