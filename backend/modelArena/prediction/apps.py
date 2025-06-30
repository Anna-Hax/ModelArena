from django.apps import AppConfig
import os 

class PredictionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'prediction'

    def ready(self):
        from django_celery_beat.models import PeriodicTask, IntervalSchedule
        import json

        # Avoid running this on migrations or shell commands
        if os.environ.get('RUN_MAIN') != 'true':
            return

        schedule, _ = IntervalSchedule.objects.get_or_create(
            every=1,
            period=IntervalSchedule.MINUTES,
        )

        # Only create if it doesn't already exist
        if not PeriodicTask.objects.filter(name='Evaluate Predictions Task').exists():
            PeriodicTask.objects.create(
                interval=schedule,
                name='Evaluate Predictions Task',
                task='prediction.actual_data_d.evaluate_predictions',
                kwargs=json.dumps({}),
            )
