# Required Environment Variables for Render

These environment variables **must be set** in your Render service for the application to start successfully.

## Required Variables

### Django Core
- `DJANGO_SETTINGS_MODULE=config.settings.production`
- `DJANGO_SECRET_KEY` - Generate a secure random key (e.g., 50+ character random string)
- `DJANGO_ADMIN_URL` - Custom admin URL path (e.g., `admin/` or something more secure like `secret-admin-path/`)
- `DJANGO_ALLOWED_HOSTS` - Your Render domain (e.g., `yourapp.onrender.com`)

### Database
- `DATABASE_URL` - Provided automatically by Render PostgreSQL (use internal connection string)

### Email (Mailgun)
- `MAILGUN_API_KEY` - Your Mailgun API key
- `MAILGUN_SENDER_DOMAIN` - Your verified Mailgun domain
- `MAILGUN_API_URL` - Mailgun API URL (e.g., `https://api.mailgun.net/v3`)

### SSL/Security
- `USE_SSL=True` - Enable SSL/HTTPS settings

## Optional Variables (with defaults)

- `DJANGO_SECURE_SSL_REDIRECT=True` - Redirect HTTP to HTTPS
- `DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True`
- `DJANGO_SECURE_HSTS_PRELOAD=True`
- `DJANGO_SECURE_CONTENT_TYPE_NOSNIFF=True`
- `CONN_MAX_AGE=60` - Database connection max age in seconds
- `MEDIA_URL=/media` - URL path for media files
- `EMAIL_BACKEND=anymail.backends.mailgun.EmailBackend`

## How to Set in Render

1. Go to your Render service dashboard
2. Click on **Environment** in the left sidebar
3. Add each variable with its value
4. Click **Save Changes**
5. Render will automatically redeploy with the new environment variables

## Generate Secret Key

Use Python to generate a secure secret key:

```python
import secrets
print(secrets.token_urlsafe(50))
```

Or use this one-liner:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

