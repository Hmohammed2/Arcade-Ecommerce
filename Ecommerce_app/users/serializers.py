from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from .models import UserAddress

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
    
class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserAddressSerializer(ModelSerializer):
    class Meta:
        model = UserAddress
        exclude = ["user"]  # we'll attach it automatically in the view