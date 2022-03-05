from flask import Response, request
from flask import (
    request, make_response, render_template, redirect
)
from flask_restful import Resource
from models import User
from . import get_authorized_user_ids
import json
import flask_jwt_extended

class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def get(self):
        # Your code here:
        auth_ids = get_authorized_user_ids(self.current_user)
        data = User.query.filter(User.id.not_in(auth_ids)).limit(7)
        data = [
            item.to_dict() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
