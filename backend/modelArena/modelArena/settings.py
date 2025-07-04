from datetime import timedelta
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()  # Only if you're using a .env file

BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key — do NOT hardcode in production
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", 'insecure-dev-secret-key')

# Debug
DEBUG = False  # Change to True only in local development

# Hosts allowed to access the app
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "yourdomain.com"]  # Replace with real domain/IP

# Timezone
TIME_ZONE = "Asia/Kolkata"
USE_TZ = True

# Celery config (use service name 'redis' in Docker)
CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'rest_framework',
    'corsheaders',
    'django_celery_beat',
    'home',
    'model',
    'rest_framework_simplejwt',
    'prediction.apps.PredictionConfig',
    'hackathon',
    'arena',
    # 'staking',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Media
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')  # Required for collectstatic in deployment

# URLs and WSGI
ROOT_URLCONF = 'modelArena.urls'
WSGI_APPLICATION = 'modelArena.wsgi.application'

# CORS (for frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Update for deployed frontend
]

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
USE_I18N = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# JWT config
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=10),
}
