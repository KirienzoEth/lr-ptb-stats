'use client';
import { Card, CardBody, Image, Heading, Link, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import './page.scss';

export default function Page() {
  return (
    <Flex id="homepage">
      <Link as={NextLink} href="/poke-the-bear/ethereum">
        <Card maxW="sm">
          <CardBody textAlign="center">
            <Image src="/ptb-logo.webp" />
            <Heading marginTop="20px">Poke The Bear (ETH)</Heading>
          </CardBody>
        </Card>
      </Link>
      <Link as={NextLink} href="/poke-the-bear/arbitrum">
        <Card maxW="sm">
          <CardBody textAlign="center">
            <Image src="/ptb-logo.webp" />
            <Heading marginTop="20px">Poke The Bear (ARB)</Heading>
          </CardBody>
        </Card>
      </Link>
      <Link
        _hover={{ textDecoration: 'none', cursor: 'default' }}
        as={NextLink}
        href="#"
      >
        <Card maxW="sm">
          <CardBody textAlign="center">
            <Image
              filter="grayscale(100%)"
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
