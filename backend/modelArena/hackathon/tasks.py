from celery import shared_task

@shared_task(name='hackathon.check_and_fulfill')
def check_and_fulfill():
    from hackathon.models import HackathonConfig
    from django.utils import timezone
    from blockchain.arena_contract import fulfill_winner
    from prediction.models import PredictionResult
    from django.db.models import ExpressionWrapper, F, FloatField
    from django.core.exceptions import ObjectDoesNotExist
    from datetime import timedelta

    now = timezone.now()
    
    # Get only unfulfilled hackathons
    all_hackathons = HackathonConfig.objects.filter(fulfilled=False)

    for hackathon in all_hackathons:
        end_time = hackathon.start_time + timedelta(minutes=hackathon.duration_minutes)
        if now >= end_time:
            predictions = PredictionResult.objects.filter(model__hackathon=hackathon).annotate(
                avg_error=ExpressionWrapper(
                    (F('error_5') + F('error_10') + F('error_15')) / 3.0,
                    output_field=FloatField()
                )
            ).order_by('avg_error')

            if not predictions.exists():
                continue

            best_prediction = predictions.first()
            user = best_prediction.model.user

            try:
                wallet = user.profile.wallet_address
            except ObjectDoesNotExist:
                print(f" User '{user.username}' has no profile. Skipping.")
                continue

            if not wallet:
                print(f" User '{user.username}' has no wallet address. Skipping.")
                continue

            try:
                fulfill_winner(hackathon.blockchain_id, wallet)
                hackathon.fulfilled = True
                hackathon.save()
                print(f" Fulfilled Hackathon #{hackathon.id} to {user.username}")
            except Exception as e:
                print(f" Fulfill error for Hackathon #{hackathon.id}: {str(e)}")
