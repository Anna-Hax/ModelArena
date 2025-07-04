from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('home.urls')),
    path('model/', include('model.urls')),
    path('prediction/', include('prediction.urls')),
    path("hackathon/", include("hackathon.urls")),
    path("arena/", include("arena.urls")),
    # path("stake/", include("staking.urls")),

    # Serve CSV and other uploaded files
    re_path(
        r'^uploads/(?P<path>.*)$',
        serve,
        {'document_root': os.path.join(settings.BASE_DIR, 'uploads','data')},
    ),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
