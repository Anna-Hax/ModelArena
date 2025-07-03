import os
import sys
import django
import io

# Set up Django environment properly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "modelArena.settings")

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    sys.exit(1)

# Now import Django components
from django.contrib.auth.models import User
from django.core.files import File
from prediction.models import PredictionResult
from hackathon.models import HackathonConfig
from model.models import AiModel
from home.models import Profile  # Make sure this is your correct profile model location

def create_test_predictions():
    try:
        # Get the hackathon first since we need it for predictions
        hackathon = HackathonConfig.objects.get(blockchain_id=0)
        
        # Get or create test user
        user, created = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com', 'password': 'testpass123'}
        )
        
        # Ensure profile exists with wallet address
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={'wallet_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'}
        )
        
        # Create model
        dummy_file = io.BytesIO(b'Test model content')
        model = AiModel.objects.create(
            user=user,
            model=File(dummy_file, name='test_model.h5'),
            hackathon=hackathon
        )
        
        # Create test predictions
        predictions = [
            {
                'model': model,
                'hackathon': hackathon,
                'pred_5': 100.50, 'pred_10': 105.25, 'pred_15': 110.00,
                'actual_5': 102.00, 'actual_10': 104.80, 'actual_15': 109.50,
                'error_5': abs(100.50-102.00), 
                'error_10': abs(105.25-104.80),
                'error_15': abs(110.00-109.50)
            },
            {
                'model': model,
                'hackathon': hackathon,
                'pred_5': 98.75, 'pred_10': 103.50, 'pred_15': 108.25,
                'actual_5': 99.20, 'actual_10': 104.10, 'actual_15': 107.80,
                'error_5': abs(98.75-99.20),
                'error_10': abs(103.50-104.10),
                'error_15': abs(108.25-107.80)
            },
            {
                'model': model,
                'hackathon': hackathon,
                'pred_5': 102.25, 'pred_10': 107.00, 'pred_15': 111.75,
                'actual_5': 101.80, 'actual_10': 106.50, 'actual_15': 111.20,
                'error_5': abs(102.25-101.80),
                'error_10': abs(107.00-106.50),
                'error_15': abs(111.75-111.20)
            }
        ]
        
        for pred_data in predictions:
            pred = PredictionResult.objects.create(**pred_data)
            print(f"Created prediction ID {pred.id}")
            
        print("Test data created successfully!")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_predictions()