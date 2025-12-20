# articles/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "thumbnail_url",
            "published_at",
            "author_name",
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class ArticleDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ("author", "created_at", "updated_at")
    
    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
