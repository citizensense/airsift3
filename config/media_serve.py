"""
Serve media files in production when not using a separate media server.
"""
from django.conf import settings
from django.http import FileResponse, Http404
from django.views.static import serve as django_serve
import os


def serve_media(request, path):
    """
    Serve media files from MEDIA_ROOT.
    This is a simple wrapper around Django's serve() view that works in production.
    For better performance in production, use S3/CDN or nginx.
    """
    document_root = settings.MEDIA_ROOT
    
    # Security: prevent directory traversal
    full_path = os.path.join(document_root, path)
    full_path = os.path.abspath(full_path)
    
    if not full_path.startswith(os.path.abspath(document_root)):
        raise Http404("Invalid path")
    
    if not os.path.exists(full_path):
        raise Http404("File not found")
    
    return FileResponse(open(full_path, 'rb'))

