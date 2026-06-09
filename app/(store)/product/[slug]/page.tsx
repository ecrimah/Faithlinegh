import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import JsonLd from '@/components/JsonLd';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  pageMetadata,
  productSchema,
  breadcrumbSchema,
  toPlainText,
  SITE_NAME,
} from '@/lib/seo';

type ProductRow = {
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string | null;
  brand?: string | null;
  quantity?: number | null;
  track_quantity?: boolean | null;
  continue_selling?: boolean | null;
  tags?: string[] | null;
  rating_avg?: number | null;
  review_count?: number | null;
  categories?: { name: string; slug: string } | null;
  product_images?: { url: string; position: number | null; alt_text: string | null }[] | null;
};

async function getProduct(slug: string): Promise<ProductRow | null> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    const { data } = await supabaseAdmin
      .from('products')
      .select(
        'name, slug, description, short_description, seo_title, seo_description, price, compare_at_price, sku, brand, quantity, track_quantity, continue_selling, tags, rating_avg, review_count, categories(name, slug), product_images(url, position, alt_text)'
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    return (data as unknown as ProductRow) || null;
  } catch {
    return null;
  }
}

function productImages(p: ProductRow): string[] {
  const imgs = (p.product_images || [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.url)
    .filter(Boolean);
  return imgs;
}

function isInStock(p: ProductRow): boolean {
  if (p.track_quantity === false) return true;
  if (p.continue_selling) return true;
  return (p.quantity ?? 0) > 0;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);

  if (!p) {
    return pageMetadata({ title: 'Product Not Found', path: `/product/${slug}`, noindex: true });
  }

  const category = p.categories?.name;
  const description = toPlainText(
    p.seo_description ||
      p.short_description ||
      p.description ||
      `Shop ${p.name}${category ? ` (${category})` : ''} at ${SITE_NAME}. Quality, affordable fashion with nationwide delivery across Ghana.`,
    160
  );

  return pageMetadata({
    title: p.seo_title || p.name,
    description,
    path: `/product/${p.slug || slug}`,
    images: productImages(p),
    type: 'product',
    keywords: [p.name, category, p.brand, ...(p.tags || [])].filter(Boolean) as string[],
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProduct(slug);

  let schemas: unknown[] = [];
  if (p) {
    const category = p.categories?.name;
    const categorySlug = p.categories?.slug;
    schemas = [
      productSchema({
        name: p.name,
        description: p.short_description || p.description || '',
        images: productImages(p),
        price: p.price,
        compareAtPrice: p.compare_at_price,
        currency: 'GHS',
        sku: p.sku || undefined,
        inStock: isInStock(p),
        brand: p.brand || undefined,
        category,
        rating: p.rating_avg && p.rating_avg > 0 ? p.rating_avg : undefined,
        reviewCount: p.review_count && p.review_count > 0 ? p.review_count : undefined,
        url: `/product/${p.slug || slug}`,
      }),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        ...(category ? [{ name: category, url: `/shop?category=${categorySlug || ''}` }] : []),
        { name: p.name, url: `/product/${p.slug || slug}` },
      ]),
    ];
  }

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <ProductDetailClient slug={slug} />
    </>
  );
}
