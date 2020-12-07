from django.shortcuts import render

def dustboxes(request):
    return render(request, 'dustboxes/dustboxes.html')
