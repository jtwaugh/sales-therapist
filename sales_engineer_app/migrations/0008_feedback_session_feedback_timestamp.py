# Generated by Django 4.2 on 2023-12-01 04:14

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('sales_engineer_app', '0007_alter_usersession_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='sales_engineer_app.usersession'),
        ),
        migrations.AddField(
            model_name='feedback',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
