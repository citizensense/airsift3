from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from wagtail.core.models import Page, GroupPagePermission, GroupCollectionPermission, Collection
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

class UserIndexPage(Page):
    '''
    This is a user's root directory.
    They have control over everything beneath here... at least, to a certain extent.
    '''

    subpage_types = [
        'observations.Observation',
        # 'datastories.DataStory',
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
    new_group, created = Group.objects.get_or_create(name=user.username)

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
    home = HomePage.objects.child_of(Page.get_first_root_node()).first()
    home.add_child(instance=person_index_page)

    # Save new page as first revision
    person_index_page.save_revision()

    # Create new add GroupPagePermission
    for permission in [
        # Allow page creation
        'add',
        # Allow edits
        'edit',
        # Allow users to publish their pages straight away
        'publish'
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
