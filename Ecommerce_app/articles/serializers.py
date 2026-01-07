# articles/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )

    class Meta:
        model = Article
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "thumbnail",
            "published_at",
            "author_name",
        )


class ArticleDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )
       # 🔥 THIS IS THE FIX
    content = serializers.CharField(
        trim_whitespace=False,
        style={"base_template": "textarea.html"}
    )
    
    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ("author", "created_at", "updated_at")
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("content"):
            data["content"] = data["content"].encode().decode("unicode_escape")
        return data
