import React from 'react';
import {BookReaderClient} from '@/components/reader/book-reader-client';

export default async function BookReadingPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  return <BookReaderClient slug={slug} />;
}
