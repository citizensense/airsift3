import django
from django.views.generic import RedirectView

if django.VERSION >= (1, 10):
    from django.urls import reverse_lazy
else:
    from django.core.urlresolvers import reverse_lazy

class CaptureLogin(RedirectView):
    url = reverse_lazy('account_login')
    query_string = True
    permanent = False

capture_login = CaptureLogin.as_view()

class CaptureLogout(RedirectView):
    url = reverse_lazy('account_logout')
    query_string = True
    permanent = False

capture_logout = CaptureLogout.as_view()
