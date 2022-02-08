from flask import Response, request
from flask_restful import Resource
from models import Following
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowerListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here
        data = Following.query.filter_by(following_id=self.current_user.id).all()
#         auth_ids = get_authorized_user_ids(self.current_user)
#         data = Following.query.filter(Following.user_id.in_(auth_ids)).all()
        data = [
            item.to_dict_follower() for item in data
        ]
#         for d in data:
#             print(d.get("follower"))
        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowerListEndpoint, 
        '/api/followers', 
        '/api/followers/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
