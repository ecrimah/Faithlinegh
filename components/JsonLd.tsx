import { jsonLd } from '@/lib/seo';

/**
 * Renders one or more JSON-LD structured data blocks.
 * Pass a single schema object or an array of them.
 */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(block) }}
        />
      ))}
    </>
  );
}
