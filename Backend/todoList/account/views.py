# from django.shortcuts import render
# from django.http import HttpResponse
from django.http import JsonResponse
from .models import Account
from django.views.decorators.csrf import csrf_exempt

import io
from rest_framework.parsers import JSONParser
from .serializers import AccountSerializer
from rest_framework_simplejwt.tokens import RefreshToken

def get_token(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access' : str(refresh.access_token),
    }

# Create your views here.
@csrf_exempt
def signup(request):
    print('SIGNUP view was called')
    if(request.method == 'POST'):
        json_data = request.body
        stream = io.BytesIO(json_data)
        python_data = JSONParser().parse(stream)
        serializer = AccountSerializer(data=python_data)
        if(serializer.is_valid()):
            serializer.save()
            res = {'res':'Account created successfully.'}
            return JsonResponse(res, status=201)
        else:
            res = serializer.errors
            return JsonResponse(res, status=400)
    else:
        res = {'res':'Method is wrong.'}
    return JsonResponse(res, status = 405)

@csrf_exempt
def signin(request):
    print('SIGNIN view was called')
    if(request.method == 'POST'):
        json_data = request.body
        stream = io.BytesIO(json_data)
        python_data = JSONParser().parse(stream)
        email = python_data['email']
        password = python_data['password']
        if not email:
            return JsonResponse({'msg':'Email field must not be empty.'}, status = 400)
        if not password:
            return JsonResponse({'msg':'Password field must not be empty.'}, status = 400)
        try:
            account = Account.objects.get(email = email)
            if account.password != password:
                return JsonResponse({'msg':'Wrong Password.'}, status = 401)
            else:
                refresh = RefreshToken.for_user(account)
                res = {
                    'msg': 'Found Account.',
                    'refresh': str(refresh),
                    'access' : str(refresh.access_token),
                }
                status = 200
        except Account.DoesNotExist:
            return JsonResponse({'msg':'Account not found! Write correct Email Id or Sign Up.'}, status = 401)
    else:
        return JsonResponse({'msg':'Method is wrong'}, status = 405)

    return JsonResponse(res, status=status)