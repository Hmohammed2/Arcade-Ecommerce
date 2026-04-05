# articles/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True
    )
    
    thumbnail = serializers.ImageField(use_url=False)

    class Meta:
        model = Article
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "thumbnail",
            "featured",
            "published_at",
            "author_name",
        )
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("thumbnail"):
            data["thumbnail"] = "/media/" + data["thumbnail"].lstrip("/")
        return data


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
    thumbnail = serializers.ImageField(use_url=False)
    
    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ("author", "created_at", "updated_at")
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("thumbnail"):
            data["thumbnail"] = "/media/" + data["thumbnail"].lstrip("/")
        return data
