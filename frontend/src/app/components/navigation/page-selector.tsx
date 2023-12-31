'use client';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { useState } from 'react';

export default function PageSelector({
  isDisabled = false,
  isLastPage = false,
  pageChangedHandler,
}: {
  isDisabled?: boolean;
  isLastPage?: boolean;
  pageChangedHandler: Function;
}) {
  const [page, setPage] = useState(0);
  return (
    <div style={{ textAlign: 'center', width: '100%', padding: '10px' }}>
      <IconButton
        isDisabled={page === 0 ? true : isDisabled}
        marginRight="10px"
        onClick={() => {
          setPage(page - 1);
          pageChangedHandler(page - 1);
        }}
        aria-label="Previous page"
        icon={<ArrowBackIcon />}
      />
      {page + 1}
      <IconButton
        isDisabled={isDisabled || isLastPage}
        marginLeft="10px"
        onClick={() => {
          setPage(page + 1);
          pageChangedHandler(page + 1);
        }}
        aria-label="Next page"
        icon={<ArrowForwardIcon />}
      />
    </div>
  );
}
