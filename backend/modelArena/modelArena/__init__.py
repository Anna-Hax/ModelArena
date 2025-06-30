from .celery import app as celery_app

import prediction.actual_data_d

__all__ = ('celery_app',)