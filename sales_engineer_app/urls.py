"""
URL configuration for sales_engineer_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path, include, re_path
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('switch-scenario/<str:scenario_name>/', views.switch_scenario, name='switch_scenario'),
    path('load-scenario-data/', views.load_scenario_data, name='load_scenario_data'),
    path('admin/', admin.site.urls),
    path('api/', include('chatbot.urls')),
    path('api/create-user/', views.create_user, name='create_user'),
    path('api/check-new-ip/', views.check_new_ip, name='check_new_cookie'),
    path('api/check-user/', views.check_new_user, name='check_new_user'),
    path('api/create-session/', views.create_user_session, name='create_user_session'),
    path('api/feedback/', views.submit_feedback, name='submit_feedback'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns.append(re_path('.*', views.index))
