# articles/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class Article(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="articles")
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField(help_text="Markdown content")
    thumbnail = models.ImageField(upload_to="articles/thumbnails/", blank=True, null=True)

    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    cta_label = models.CharField(max_length=255, blank=True)
    cta_url = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-published_at", "-created_at")
        indexes = [
            models.Index(fields=["slug", "is_published"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
