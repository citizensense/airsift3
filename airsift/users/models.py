from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from wagtail.core.models import PAGE_PERMISSION_TYPES, Page, GroupPagePermission, GroupCollectionPermission, Collection
from airsift.home.models import HomePage

class User(AbstractUser):
    """Default user for airsift."""

    #: First and last name do not cover name patterns around the globe
    name = CharField(_("Display Name"), blank=True, max_length=255)

    def get_absolute_url(self):
        """Get url for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})

    def scoped_contributions_group_name(user):
        return f'scoped_contributions_for_{user.username}'

    def contributor_group_name(self):
        print('contributor_group_name')
        name = self.scoped_contributions_group_name()
        print(name)
        return name

    def contributor_group(self):
        print('contributor_group')
        group = Group.objects.filter(name=self.scoped_contributions_group_name()).first()
        print(group)
        return group

    def contributor_page_permissions(self):
        print('contributor_page_permissions')
        page_permission = GroupPagePermission.objects.filter(group=self.contributor_group()).first()
        print(page_permission)
        return page_permission

    def contributor_page_permissions_page(self):
        print('contributor_page_permissions_page')
        page_permission = self.contributor_page_permissions()
        page = page_permission.page
        print(page)
        # TODO: Create if doesn't exist?
        return page

    def is_staff_editor(self):
        print('is_staff_editor')
        if (
            self.is_superuser
            or self in Group.objects.filter(name='Editors').get().user_set.all()
            or self in Group.objects.filter(name='Moderators').get().user_set.all()
        ):
            return True
        else:
            return False

    def root_page(self):
        print('root_page')
        if self.is_staff_editor():
            return HomePage.get_active()
        else:
            return self.contributor_page_permissions_page()

    def has_contributor_group(self):
        print(self.contributor_group_name())
        print(self.contributor_group())
        return self.contributor_group() is not None

    def get_user_action_urls(self):
        page = self.root_page()

        if page is None:
            # Trigger login to figure out what to do
            return {
                "view_root_page": f'/cms/pages/',
                "create_observation": f'/user_action_redirect/create_observation/',
                "create_datastory": f'/user_action_redirect/create_datastory/',
            }
        else:
            return {
                "view_root_page": f'/cms/pages/{page.id}/',
                "create_observation": f'/cms/pages/add/observations/observation/{page.id}/',
                "create_datastory": f'/cms/pages/add/datastories/datastory/{page.id}/',
            }

class UserIndexPage(Page):
    '''
    This is a user's root directory.
    They have control over everything beneath here... at least, to a certain extent.
    '''
    show_in_menus_default = True
    subpage_types = [
        'observations.Observation',
        'datastories.DataStory',
    ]
    pass

@receiver(user_signed_up)
def create_user_group_and_pages(sender, **kwargs):
    """
    When a new user signs up create a unique group and page for them.
    Assign it the appropriate permission for admin, page and collection access.
    """

    # Grab the new user
    user = kwargs['user']

    # Create a group object that matches their username
    new_group, created = Group.objects.get_or_create(name=user.scoped_contributions_group_name())

    # Add the new group to the database
    user.groups.add(new_group)

    # Create new permission to access the wagtail admin
    access_admin = Permission.objects.get(
        content_type__app_label='wagtailadmin',
        codename='access_admin'
    )

    # Add the permission to the group
    new_group.permissions.add(access_admin)

    # Now start creating page access
    # Create unique UserIndexPage for the user
    person_index_page = UserIndexPage(title=f"{user.name}'s contributions")

    # Add UserIndexPage to homepage as a child
    home = HomePage.get_active()
    home.add_child(instance=person_index_page)

    # Save new page as first revision
    person_index_page.save_revision()

    # Create new add GroupPagePermission
    for permission in [
        # Allow page creation
        PAGE_PERMISSION_TYPES[0],
        # Allow edits
        PAGE_PERMISSION_TYPES[1],
        # Allow users to publish their pages straight away
        PAGE_PERMISSION_TYPES[2],
    ]:
        GroupPagePermission.objects.create(
            group=new_group,
            page=person_index_page,
            permission_type=permission
        )

    # Create a collection that this user can put images in
    root_collection = Collection.get_first_root_node()
    image_collection = Collection(name=f"{user.name}'s images")
    root_collection.add_child(instance=image_collection)

    # Create new GroupCollectionPermission for Profile Images collection
    GroupCollectionPermission.objects.create(
        group=new_group,
        collection=image_collection,
        permission=Permission.objects.get(
            content_type__app_label='wagtailimages',
            codename='add_image'
        )
    )
