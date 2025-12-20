# articles/urls.py
from django.urls import path
from .views import (
    ArticleListView,
    ArticleDetailView,
    ArticleCreateView,
    ArticleUpdateView,
)

urlpatterns = [
    path("articles/", ArticleListView.as_view()),
    path("article/<slug:slug>/", ArticleDetailView.as_view()),
    path("article/create/", ArticleCreateView.as_view()),
    path("article/<slug:slug>/edit/", ArticleUpdateView.as_view()),
]
