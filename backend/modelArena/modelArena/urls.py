from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
import os

# ✅ Define this before urlpatterns
def root_view(request):
    return HttpResponse("✅ AI Block API is running. Frontend served separately or coming soon.")

urlpatterns = [
    path('', root_view),  # ✅ Now this works correctly

    path('admin/', admin.site.urls),
    path('auth/', include('home.urls')),
    path('model/', include('model.urls')),
    path('prediction/', include('prediction.urls')),
    path("hackathon/", include("hackathon.urls")),
    path("arena/", include("arena.urls")),

    # re_path for uploaded files
    re_path(
        r'^uploads/(?P<path>.*)$',
        serve,
        {'document_root': os.path.join(settings.BASE_DIR, 'uploads', 'data')},
    ),
]

# ✅ For local dev media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
