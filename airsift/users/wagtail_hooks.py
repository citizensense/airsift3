from wagtail.core import hooks

@hooks.register('construct_explorer_page_queryset')
def show_authors_only_their_articles(parent_page, pages, request):
    '''
    Users only see their pages in the page explorer
    '''
    user_group = request.user.groups.filter(name='Authors').exists()
    if user_group:
        pages = pages.filter(owner=request.user)

    return pages

@hooks.register('construct_image_chooser_queryset')
def filter_images_by_user(images, request):
    '''
    The image chooser only displays images uploaded by the user
    '''
    images = images.filter(uploaded_by_user=request.user)

    return images

from django.conf.urls.static import static
from django.utils.html import format_html

from wagtail.core import hooks

@hooks.register("insert_global_admin_css", order=100)
def global_admin_css():
    """Add /static/css/custom.css to the admin."""
    return format_html(
        '<link rel="stylesheet" href="{}">',
        "/static/wagtail/main.css"
    )

@hooks.register("insert_global_admin_js", order=100)
def global_admin_js():
    """Add /static/css/custom.js to the admin."""
    return format_html(
        '<script src="{}"></script>',
        "/static/wagtail/main.js"
    )
