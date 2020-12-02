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
