from django.shortcuts import render
from account.models import Account
from .models import Task
import io
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from tasks.serializers import TaskSerializer
from django.views.decorators.csrf import csrf_exempt

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split()[1]
    try:
        access_token = AccessToken(token)
        usrId = access_token['user_id']
        user = Account.objects.get(id = usrId)
        return user
    except Exception as e:
        return None

@csrf_exempt
def todo_api(request, ID=None):
    user = get_user_from_token(request)
    if not user:
        res = {"error" : "No Account Found."}
        status = 401
        return JsonResponse(res, status = status)
    if(request.method == 'GET'):
        tasks = Task.objects.filter(user = user)
        serializer = TaskSerializer(tasks, many = True)
        if(len(serializer.data)):
            res = {"tasks" : serializer.data}
        else:
            res = {"user" : user.name}
        return JsonResponse(res, status = 200)

    elif(request.method == 'POST'):
        json_data = request.body
        stream = io.BytesIO(json_data)
        python_data = JSONParser().parse(stream)
        serializer = TaskSerializer(data = python_data, context = {'user' : user})
        if serializer.is_valid():
            task = serializer.save()
            res = {"msg" : "Task is added.",
                   "task" : TaskSerializer(task).data}
            status = 200
        else:
            res = {"error" : "Something is wrong task is not added."}
            msg = serializer.errors.get('task')
            if msg:
                res = {"error" : msg}
            status = 400
        return JsonResponse(res, status = status, safe=False)
    
    elif(request.method == 'PUT'):
        json_data = request.body
        stream = io.BytesIO(json_data)
        python_data = JSONParser().parse(stream)
        taskObj = Task.objects.get(id = ID)
        if 'completed' in python_data:
            taskObj.completed = python_data['completed']
            taskObj.save()
            res = {'msg': f'Task status {taskObj.completed}.'}
            status = 200
        elif 'task' in python_data:
            if python_data['task']:
                taskObj.task = python_data['task']
                taskObj.save()
                res = {'msg': 'Task edited successfully.'}
                status = 200
            else:
                res = {'warning': 'Please filled edited task.'}
                status = 200
        else:
            res = {'error': 'Somthing is wrong task is not edited.'}
            msg = serializer.errors.get('task')
            if msg:
                res = {"error" : msg}
            status = 400
        return JsonResponse(res, status = status)

    elif(request.method == 'DELETE'):
        if not user:
            res = {"error" : "Task not found."}
            status = 401
            return JsonResponse(res, status = status)
        task = Task.objects.filter(id = ID)
        task.delete()
        return JsonResponse({'message': 'Task deleted successfully'}, status=200)
    else:
        res = {'error': 'Method is Wrong'}
        return JsonResponse(res, status = 401)
