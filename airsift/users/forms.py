from django.contrib.auth import forms as admin_forms
from django.contrib.auth import get_user_model
from django.forms import fields
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserChangeForm(admin_forms.UserChangeForm):
    class Meta(admin_forms.UserChangeForm.Meta):
        model = User


class UserCreationForm(admin_forms.UserCreationForm):

    error_message = admin_forms.UserCreationForm.error_messages.update(
        {"duplicate_username": _("This username has already been taken.")}
    )

    class Meta(admin_forms.UserCreationForm.Meta):
        model = User

    def clean_username(self):
        username = self.cleaned_data["username"]

        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username

        raise ValidationError(self.error_messages["duplicate_username"])


from allauth.account.forms import SignupForm
from django.contrib.auth.models import Group
editors_group = Group.objects.get(name='Editors')

class CustomSignupForm(SignupForm):
    name = fields.CharField(max_length=100, label='Real Name')

    def __init__(self, *args, **kwargs):
        super(CustomSignupForm, self).__init__(*args, **kwargs)
        self.fields.pop('password2')

    def save(self, request):
        user = super(CustomSignupForm, self).save(request)
        user.password2 = user.password
        user.save()
        # Allow the user access to the Wagtail CMS
        editors_group.user_set.add(user)
        return user
