import ArticleClient from "./ArticleClient";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClient slug={params.slug} />;
}
