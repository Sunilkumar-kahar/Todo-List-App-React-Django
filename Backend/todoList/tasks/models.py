from django.db import models
from account.models import Account

# Create your models here.
class Task(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='tasks')
    task = models.CharField(max_length=5000)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.task[:20] + ('...' if len(self.task) > 20 else "")