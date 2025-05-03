import os
from flask import Flask, render_template, request
from flask_cors import CORS
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import numpy as np
import logging
# Optional MongoDB integration
# from pymongo import MongoClient

# Initialize app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.environ.get('FRONTEND_URL', 'https://travel-app-1-1njn.onrender.com')}})

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base directory for file paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Optional MongoDB setup (commented out; uncomment to use)
"""
try:
    logger.info("Connecting to MongoDB")
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client['travel-app']
    destinations_collection = db['destinations']
    userhistory_collection = db['userhistory']
    final_collection = db['final']
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {str(e)}")
    raise
"""

# Load datasets and models
features = ['Name_x', 'State', 'Type', 'BestTimeToVisit', 'Preferences', 'Gender', 'NumberOfAdults', 'NumberOfChildren']
try:
    logger.info("Loading label_encoders.pkl")
    label_encoders = pickle.load(open(os.path.join(BASE_DIR, 'label_encoders.pkl'), 'rb'))
    logger.info("Loading model.pkl")
    model = pickle.load(open(os.path.join(BASE_DIR, 'model.pkl'), 'rb'))
    logger.info("Loading CSVs")
    destinations_df = pd.read_csv(os.path.join(BASE_DIR, 'Expanded_Destinations.csv'))
    userhistory_df = pd.read_csv(os.path.join(BASE_DIR, 'Final_Updated_Expanded_UserHistory.csv'))
    df = pd.read_csv(os.path.join(BASE_DIR, 'final_df.csv'))
except Exception as e:
    logger.error(f"Error loading files: {str(e)}")
    raise

# Create user-item matrix for collaborative filtering
try:
    logger.info("Creating user-item matrix")
    user_item_matrix = userhistory_df.pivot(index='UserID', columns='DestinationID', values='ExperienceRating')
    user_item_matrix.fillna(0, inplace=True)
    user_similarity = cosine_similarity(user_item_matrix)
except Exception as e:
    logger.error(f"Error creating user-item matrix: {str(e)}")
    raise

# Function to recommend destinations based on user similarity (fallback if no user_id)
def collaborative_recommend(destinations_df, user_item_matrix, num_recommendations=5):
    try:
        logger.info("Running collaborative filtering")
        avg_ratings = user_item_matrix.mean(axis=0)
        recommended_destinations_ids = avg_ratings.sort_values(ascending=False).head(num_recommendations).index
        recommendations = destinations_df[destinations_df['DestinationID'].isin(recommended_destinations_ids)][
            ['DestinationID', 'Name', 'State', 'Type', 'Popularity', 'BestTimeToVisit']
        ]
        # Remove duplicates by Name, keeping the first (highest Popularity after sorting)
        recommendations = recommendations.drop_duplicates(subset=['Name'], keep='first')
        logger.info(f"Recommendations generated: {recommendations.shape}, unique names: {recommendations['Name'].nunique()}")
        return recommendations
    except Exception as e:
        logger.error(f"Error in collaborative_recommend: {str(e)}")
        return pd.DataFrame()

# Prediction system
def recommend_destinations(user_input, model, label_encoders, features, data):
    try:
        logger.info(f"Processing user input: {user_input}")
        encoded_input = {}
        for feature in features:
            if feature in label_encoders:
                if user_input[feature] not in label_encoders[feature].classes_:
                    logger.error(f"Value {user_input[feature]} not in label encoder for {feature}")
                    raise ValueError(f"Invalid value for {feature}: {user_input[feature]}")
                encoded_input[feature] = label_encoders[feature].transform([user_input[feature]])[0]
            else:
                encoded_input[feature] = user_input[feature]
        input_df = pd.DataFrame([encoded_input])
        logger.info("Predicting popularity")
        predicted_popularity = model.predict(input_df)[0]
        logger.info(f"Predicted popularity: {predicted_popularity}")
        return predicted_popularity
    except Exception as e:
        logger.error(f"Error in recommend_destinations: {str(e)}")
        raise

# Route for the Home Page
@app.route('/')
def index():
    return render_template('index.html')

# Route for Travel Recommendation Page
@app.route('/recommendation')
def recommendation():
    return render_template('recommendation.html')

# Route for the recommendation
@app.route("/recommend", methods=['GET', 'POST'])
def recommend():
    if request.method == "POST":
        try:
            logger.info("Received form submission")
            user_input = {
                'Name_x': request.form['name'],
                'Type': request.form['type'],
                'State': request.form['state'],
                'BestTimeToVisit': request.form['best_time'],
                'Preferences': request.form['preferences'],
                'Gender': request.form['gender'],
                'NumberOfAdults': int(request.form['adults']),
                'NumberOfChildren': int(request.form['children']),
            }
            logger.info(f"User input: {user_input}")
            recommended_destinations = collaborative_recommend(destinations_df, user_item_matrix)
            if recommended_destinations.empty:
                logger.warning("No recommendations generated")
                return render_template('recommendation.html', error="No recommendations available", form_submitted=True)
            recommended_destinations = recommended_destinations.sort_values(by='Popularity', ascending=False)
            predicted_popularity = recommend_destinations(user_input, model, label_encoders, features, df)
            # Extract scalar from NumPy array and format to 2 decimal places without round
            predicted_popularity_scalar = f"{float(predicted_popularity.item()):.2f}" if isinstance(predicted_popularity, np.ndarray) else f"{float(predicted_popularity):.2f}"
            logger.info(f"Rendering template with predicted_popularity: {predicted_popularity_scalar}")
            return render_template('recommendation.html', 
                                 recommended_destinations=recommended_destinations.to_dict('records'),
                                 predicted_popularity=predicted_popularity_scalar,
                                 form_submitted=True)
        except Exception as e:
            logger.error(f"Error in /recommend: {str(e)}")
            return render_template('recommendation.html', error=f"Error processing recommendations: {str(e)}", form_submitted=True)
    # On GET (page load or refresh), render empty template to clear previous output
    return render_template('recommendation.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
