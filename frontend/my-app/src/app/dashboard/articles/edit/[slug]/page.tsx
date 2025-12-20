import EditArticleClient from "./EditArticleClient";

interface EditArticlePageProps {
  params: {
    slug: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  return <EditArticleClient slug={params.slug} />;
}
