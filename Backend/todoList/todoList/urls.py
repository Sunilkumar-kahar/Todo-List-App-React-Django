from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('account.urls')),
    path('api/todo/', include('tasks.urls')),
    # path('gottoken/', TokenObtainPairView.as_view()),
    path('api/refreshtoken/', TokenRefreshView.as_view()),
    path('api/verifytoken/', TokenVerifyView.as_view())
]
