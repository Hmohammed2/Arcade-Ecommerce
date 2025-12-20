# articles/views.py
from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Article
from .serializers import ArticleDetailSerializer, ArticleListSerializer

class ArticleListView(generics.ListAPIView):
    queryset = (
    Article.objects
    .filter(is_published=True)
    .select_related("author")
    .only(
        "id",
        "slug",
        "title",
        "excerpt",
        "thumbnail",
        "published_at",
        "author_id",
    )
    .order_by("-published_at", "-created_at")
    )
    serializer_class = ArticleListSerializer
    permission_classes = [permissions.AllowAny]


class ArticleDetailView(generics.RetrieveAPIView):
    queryset = (
        Article.objects
        .filter(is_published=True)
        .select_related("author")
    )
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]


class ArticleCreateView(generics.CreateAPIView):
    serializer_class = ArticleDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ArticleUpdateView(generics.UpdateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"    # 👈 OPTIONAL but explicit
    parser_classes = (MultiPartParser, FormParser)
