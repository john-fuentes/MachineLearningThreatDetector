#BackendWithFlask/extensions.py
from authlib.integrations.flask_client import OAuth
from flask_mail import Mail


oauth = OAuth()
mail = Mail()


def init_extensions(app):
    mail.init_app(app)
    oauth.init_app(app)