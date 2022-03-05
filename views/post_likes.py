from flask import Response
from flask_restful import Resource
from flask import (
    request, make_response, render_template, redirect
)
from models import LikePost, db, Post
import json
import flask_jwt_extended
from . import can_view_post

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def post(self, post_id):
        # Your code here
        try:
            post_id = int(post_id)
            all_ids = [id for (id,) in Post.query.with_entities(Post.id).all()]
            if post_id not in all_ids:
                response_obj = {
                    "message": "Post id is invalid."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            if post_id in [id for (id,) in LikePost.query.with_entities(LikePost.post_id).filter_by(user_id=self.current_user.id).all()]:
                response_obj = {
                    "message": "Post is already liked."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=400)
            if not can_view_post(post_id, self.current_user):
                response_obj = {
                    "message": "Post is unauthorized to access."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            post_id = post_id
            user_id = self.current_user.id
            like_post = LikePost(user_id, post_id)
            db.session.add(like_post)
            db.session.commit()
            return Response(json.dumps(like_post.to_dict()), mimetype="application/json", status=201)
        except:
            response_obj = {
                "message": "Post id is in invalid format."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def delete(self, post_id, id):
        # Your code here
        try:
            id = int(id)
            all_ids = [id for (id,) in LikePost.query.with_entities(LikePost.id).all()]
            if id not in all_ids:
                response_obj = {
                    "message": "Post id is invalid."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            if not can_view_post(post_id, self.current_user):
                response_obj={
                    "message": "Post is unauthorized to access."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            LikePost.query.filter_by(id=id).delete()
            db.session.commit()
            response_obj = {
                "message": "Like is successfully deleted."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=200)
        except:
            response_obj = {
                "message": "Post id is in invalid format."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)


# @flask_jwt_extended.jwt_required()
def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
