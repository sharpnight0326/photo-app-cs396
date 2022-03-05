from flask import Response, request
from flask import (
    request, make_response, render_template, redirect
)
from flask_restful import Resource
from models import Following, User, db
import json
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def get(self):
        # Your code here
        data = Following.query.filter_by(user_id=self.current_user.id).all()
        data = [
            item.to_dict_following() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        # Your code here
        body = request.get_json()
        if len(body) == 0:
            response_obj = {
                "message": "User id is missing."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        following_id = body.get("user_id")
        try:
            following_id = int(following_id)
            all_following_ids = [id for (id,) in Following.query.with_entities(Following.following_id).all()]
            if following_id not in all_following_ids:
                response_obj = {
                    "message": "Following id is not found."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            user_id = self.current_user.id
            already_following_ids = [id for (id,) in Following.query.with_entities(Following.following_id).filter_by(user_id=user_id).all()]
            if following_id in already_following_ids:
                response_obj = {
                    "message": "Following id is duplicated."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=400)
            following = Following(user_id, following_id)
            db.session.add(following)
            db.session.commit()
            return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)
        except:
            response_obj = {
                "message": "Following id is invalid."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # Your code here
        try:
            id = int(id)
            all_ids = [id for (id,) in Following.query.with_entities(Following.id).filter_by(user_id=self.current_user.id).all()]
            if id not in all_ids:
                response_obj = {
                    "message": "Id is invalid or unauthorized."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            Following.query.filter_by(id=id).delete()
            db.session.commit()
            response_obj = {
                "message": "Following {0} is successfully deleted.".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=200)
        except:
            response_obj = {
                "message": "Id is invalid."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
