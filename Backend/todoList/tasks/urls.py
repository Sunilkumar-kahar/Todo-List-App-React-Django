from django.contrib import admin
from django.urls import path
from .views import todo_api

urlpatterns = [
    path('tasks/', todo_api),
    path('tasks/<int:ID>/', todo_api)
]
