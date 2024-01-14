import { Code, Flex, Image, Link } from '@chakra-ui/react';
import './footer.scss';

export default function Footer() {
  return (
    <Flex id="footer">
      <Flex>
        Made by Kirienzo:{' '}
        <Link
          marginLeft={'10px'}
          href="https://twitter.com/Kirienzo"
          isExternal
        >
          <Image width="16px" src="/x-logo-white.png" />
        </Link>
        <Link
          margin={'0 10px'}
          href="https://github.com/KirienzoEth/lr-ptb-stats"
          isExternal
        >
          <Image width="16px" src="/github-logo-white.png" />
        </Link>
      </Flex>
      <Flex>
        Donate:
        <Code marginLeft={'10px'}>
          0x8057ab90850770615F6fC9100B5d560bB32fe785
        </Code>
      </Flex>
    </Flex>
  );
}
