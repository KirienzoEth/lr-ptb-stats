'use client';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React, { ReactElement } from 'react';
import { getNetwork } from './utils';
import './breadcrumbs.scss';

export default function Breadcrumbs() {
  const pathName = usePathname();
  const pathElements = pathName.slice(1).split('/');
  const breadcrumbs: ReactElement[] = [];
  const network = getNetwork();

  if (pathElements[0] === 'poke-the-bear') {
    breadcrumbs.push(
      <BreadcrumbItem key="ptb">
        <BreadcrumbLink href={`/poke-the-bear/${network}#`}>
          Poke The Bear ({network})
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
    pathElements.shift();
    pathElements.shift();
    if (pathElements[0] && pathElements[0].slice(0, 2) === '0x') {
      breadcrumbs.push(
        <BreadcrumbItem key="#">
          <BreadcrumbLink href="#">Player stats</BreadcrumbLink>
        </BreadcrumbItem>
      );
    }
  }

  return (
    <Breadcrumb
      id="breadcrumbs"
      display={breadcrumbs.length === 0 ? 'none' : ''}
    >
      <BreadcrumbItem key="/">
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      {breadcrumbs}
    </Breadcrumb>
  );
}
