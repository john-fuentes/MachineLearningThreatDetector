from flask import Flask
import threading
from flask_cors import CORS
from config import Config
from extensions import mail, oauth, init_extensions
from models import db, User
from routes.auth_routes import auth_bp
from elasticsearchAPI.es_ml_results import ml_blueprint
from elasticsearchAPI.es_unprocessed_logs import logs_blueprint
from processedLogs.elasticsearch_ml_results import kafka_consumer_thread_processed_logs_elasticsearch
from unprocessedLogs.elasticsearch_logs import kafka_consumer_elasticsearch_raw_logs
from unprocessedLogs.kafka_raw_logs import kafka_consumer_thread_raw_logs
from unprocessedLogs.sse_kafka import kafka_consumer_thread_raw_logs_sse, sse_blueprint
from routes.vm_routes import vm_bp


def create_app():
    app = Flask(__name__)
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:3000"],
        resources={r"/*": {"origins": "http://localhost:3000"}},
    )
    app.config.from_object(Config)
    app.secret_key = app.config['SECRET_KEY']

    db.init_app(app)
    init_extensions(app)

    with app.app_context():
        
        db.create_all()
        print("Tables created successfully")

    # register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(sse_blueprint)
    app.register_blueprint(logs_blueprint)
    app.register_blueprint(ml_blueprint)
    app.register_blueprint(vm_bp)

    # ✅ start background Kafka consumer threads (works in Gunicorn)
    threading.Thread(target=kafka_consumer_thread_raw_logs, daemon=True).start()
    threading.Thread(target=kafka_consumer_elasticsearch_raw_logs, daemon=True).start()
    threading.Thread(target=kafka_consumer_thread_raw_logs_sse, daemon=True).start()
    threading.Thread(target=kafka_consumer_thread_processed_logs_elasticsearch, daemon=True).start()

    @app.route('/')
    def home():
        return "flask + kafka + elasticsearch is running"

    return app


# Make Flask app discoverable by Gunicorn
app = create_app()

if __name__ == "__main__":
    # Still works if run directly (for dev)
    app.run(host='0.0.0.0', port=5000, debug=True)

