from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-^^en$ptdj)j)ba*$w=74yyykhi=!(wktidz1g3ky=8*a7(54fx'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'daphne',  # An HTTP, HTTP2, and WebSocket protocol server for ASGI.
    'django.contrib.admin',  # The built-in Django admin interface.
    'django.contrib.auth',  # The built-in authentication app.
    'django.contrib.contenttypes',  # For managing content types.
    'django.contrib.sessions',  # For managing sessions.
    'django.contrib.messages',  # Framework for storing simple messages for the user.
    'django.contrib.staticfiles',  # To manage static files.
    'channels',  # Enables WebSockets, background tasks, and more.

    'graphene_django',  # Adds Django support for Graphene (GraphQL framework).
    'app.apps.AppConfig',  # Refers to the 'app' application's configuration.
    'corsheaders',  # To manage Cross-Origin Resource Sharing headers.
    'graphene_subscriptions'  # Enables GraphQL subscriptions in the schema.
]

# Configuration for the Graphene framework.
GRAPHENE = {
    'SCHEMA': 'app.schema.schema'  # Points to the GraphQL schema defined in the app's schema module.
}

CHANNEL_LAYERS = {
    'default': {  # Default layer configuration.
        'BACKEND': 'channels_redis.core.RedisChannelLayer',  # Using Redis as the backend for Channels.
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],  # Specifies the Redis server's host and port.
        },
    },
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',  # Adds security measures to the application.
    'django.contrib.sessions.middleware.SessionMiddleware',  # Enables session support.
    'corsheaders.middleware.CorsMiddleware',  # Handles CORS headers.
    'django.middleware.common.CommonMiddleware',  # Provides various common utilities.
    'django.middleware.csrf.CsrfViewMiddleware',  # Provides protection against CSRF attacks.
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Provides user authentication.
    'django.contrib.messages.middleware.MessageMiddleware',  # Adds support for user messages.
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Provides protection against clickjacking.
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'frontend' / 'dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'frontend/build/static'),
]

ASGI_APPLICATION = 'backend.routing.application'
WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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

# Trusted origins for CSRF. Specifies which origins should be trusted for CSRF purposes. - React App Url
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']

# Configuration for CORS headers.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Specifies which origins are allowed to access the resource.
]
CORS_ALLOW_CREDENTIALS = True  # Indicates that the actual request can include user credentials.

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
