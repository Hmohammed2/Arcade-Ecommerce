"""
URL configuration for Ecommerce_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import GoogleLogin 

urlpatterns = [
    path("api/", include("retail.urls")),
    path("admin/", admin.site.urls),
    path("marketing/", include("marketing.urls")),
    path("users/", include("users.urls")),
    path("articles/", include("articles.urls")),
    path("reviews/", include("reviews.urls")),

    # Authentication (dj-rest-auth + allauth)
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/google/", GoogleLogin.as_view(), name="google_login"),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/", include("allauth.urls")),  # must come last
]

#👇 add this only in dev
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
