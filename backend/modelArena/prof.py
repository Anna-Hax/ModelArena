# create_profile.py

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "modelArena.settings")
django.setup()

from django.contrib.auth.models import User
from home.models import Profile  # Adjust this if your Profile model is elsewhere

def ensure_profile(username="saksham", wallet="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"):
    try:
        user = User.objects.get(username=username)
        profile, created = Profile.objects.get_or_create(user=user)
        profile.wallet_address = wallet
        profile.save()
        print(f"✅ Profile {'created' if created else 'updated'} for user '{username}' with wallet '{wallet}'")
    except User.DoesNotExist:
        print(f"❌ User '{username}' does not exist")

if __name__ == "__main__":
    ensure_profile()
