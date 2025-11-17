#C:\Users\Noor\MLThreatDetector\BackendWithFlask\models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50),unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable= False)
    first_name = db.Column(db.String(50), nullable = True)
    last_name = db.Column(db.String(50), nullable = True)
    password_hash = db.Column(db.String(256))
    role = db.Column(db.String(20), default = "analyst")
    created_at = db.Column(db.DateTime, default= datetime.now)

    email_verified = db.Column(db.Boolean, default=False)
    email_code = db.Column(db.String(16), nullable=True)
    email_code_expiration= db.Column(db.DateTime, nullable=True)



    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class VM(db.Model):
    __tablename__ = "vms"
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), db.ForeignKey('users.email'), nullable=False)
    vm_name = db.Column(db.String(100), nullable=False)
    os_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="stopped")
    cpu_cores = db.Column(db.Integer, default=2)
    memory_gb = db.Column(db.Integer, default=4)
    storage_gb = db.Column(db.Integer, default=20)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime)

    # Relationship to user
    user = db.relationship('User', backref=db.backref('vms', lazy=True))
