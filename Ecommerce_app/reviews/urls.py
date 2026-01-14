# reviews/urls.py
from django.urls import path
from .views import SubmitReviewView, ApprovedReviewsListView

urlpatterns = [
    path("submit/", SubmitReviewView.as_view(), name="reviews-submit"),
    path("approved/", ApprovedReviewsListView.as_view(), name="reviews-approved"),
]
