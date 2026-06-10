from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Message
from django.contrib import messages

def index(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        
        # Save to database
        Message.objects.create(
            name=name,
            email=email,
            message=message
        )
        
        messages.success(request, 'Thank you for your message!')
        return redirect('index')
    
    # Get recent messages to display
    recent_messages = Message.objects.all().order_by('-created_at')[:5]
    return render(request, 'index.html', {'messages': recent_messages})

def health(request):
    return HttpResponse("OK")
