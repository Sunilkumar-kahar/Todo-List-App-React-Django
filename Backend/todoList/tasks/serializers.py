from rest_framework import serializers
from .models import Task
from account.models import Account

class TaskSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    user = serializers.CharField(max_length=30, read_only = True)
    task = serializers.CharField(max_length=5000, allow_blank=True)
    completed = serializers.BooleanField(default=False)

    def validate_task(self, value):
        print("Inside validation_task")
        if not value.strip():
            raise serializers.ValidationError("Please fill task input.")
        return value

    def create(self, validated_data):
        print("sk---Inside create")
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("User not found.")
        print(user)
        return Task.objects.create(user = user, **validated_data)