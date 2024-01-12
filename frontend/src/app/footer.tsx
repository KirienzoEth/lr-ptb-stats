import { Code, Flex, Image, Link } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Flex
      position={'fixed'}
      bottom={0}
      left={0}
      width={'100%'}
      height={'30px'}
      alignItems={'center'}
      fontSize={'14px'}
    >
      Made by Kirienzo:{' '}
      <Link marginLeft={'10px'} href="https://twitter.com/Kirienzo" isExternal>
        <Image width="16px" src="/x-logo-white.png" />
      </Link>
      <Link
        margin={'0 10px'}
        href="https://github.com/KirienzoEth/lr-ptb-stats"
        isExternal
      >
        <Image width="16px" src="/github-logo-white.png" />
      </Link>
      Donate: <Code margin={'0 10px'}>kirienzo.eth</Code> /{' '}
      <Code marginLeft={'10px'}>
        0x0a38C3a976B169574bD16412b654c1Ee0DB92e1B
      </Code>
    </Flex>
  );
}
