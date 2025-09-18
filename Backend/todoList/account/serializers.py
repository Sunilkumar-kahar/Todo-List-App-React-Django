from rest_framework import serializers
from .models import Account
import re

class AccountSerializer(serializers.Serializer):
    # id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128)

    def validate_name(self, value):
        nameRegex = r"^[A-Za-z\s'-]+$"
        if not re.match(nameRegex, value):
            raise serializers.ValidationError("Name must contain only letters, spaces, apostrophes or hyphens.")
        return value


    def validate_email(self, value):
        emailRegex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(emailRegex, value):
            raise serializers.ValidationError("Invalid email format.")
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_password(self, value):
        if(len(value) < 8):
            raise serializers.ValidationError("Password length must be of 8 character or more.")
        return value

    def create(self, validated_data):
        return Account.objects.create(**validated_data)