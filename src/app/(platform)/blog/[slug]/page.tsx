import { ArticleDetail } from '@/components/blog/blog-reader';

export default async function BlogArticlePage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}
