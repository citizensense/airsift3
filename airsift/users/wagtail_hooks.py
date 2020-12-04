from airsift.observations.models import Observation
from airsift.datastories.models import DataStory
from wagtail.core import hooks
from wagtail.admin.menu import MenuItem

@hooks.register('construct_explorer_page_queryset')
def show_authors_only_their_articles(parent_page, pages, request):
    if request.user.is_staff_editor():
        return pages

    '''
    Users only see their pages in the page explorer
    '''
    user_group = request.user.contributor_page_permissions()
    if user_group:
        pages = pages.filter(owner=request.user)

    return pages

@hooks.register('construct_image_chooser_queryset')
def filter_images_by_user(images, request):
    if request.user.is_staff_editor():
        return images

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

from wagtail.contrib.modeladmin.options import ModelAdmin, modeladmin_register

class DataStoryAdmin(ModelAdmin):
    model = DataStory
    menu_label = 'All Data Stories'  # ditch this to use verbose_name_plural from model
    menu_icon = 'pen'  # change as required
    list_display = ('title', 'first_published_at')
    search_fields = ('title',)
    order = 5000

modeladmin_register(DataStoryAdmin)

class ObservationAdmin(ModelAdmin):
    model = Observation
    menu_label = 'All Observations'  # ditch this to use verbose_name_plural from model
    menu_icon = 'binoculars'  # change as required
    list_display = ('title', 'observation_type', 'first_published_at')
    search_fields = ('title', 'observation_type', )
    order = 4000

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        if request.user.has_contributor_group():
            queryset = queryset.filter(owner=request.user)

        return queryset

modeladmin_register(ObservationAdmin)

@hooks.register('construct_main_menu')
def hide_most_of_the_menu(request, menu_items):
    if not request.user.is_staff_editor():
        menu_items[:] = [item for item in menu_items if item.name not in [
            'settings',
            'pages',
            'images',
            'reports'
        ]]

    menu_items += [
        MenuItem(
            'Create Observation',
            request.user.get_user_action_urls().get('create_observation'),
            classnames='icon icon-plus',
            order=2000
        )
    ]

    menu_items += [
        MenuItem(
            'Create Data Story',
            request.user.get_user_action_urls().get('create_datastory'),
            classnames='icon icon-plus',
            order=3000
        )
    ]

    return menu_items
