from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # Your code here
        body = request.get_json()
        text = body.get("text")
        if not text:
            response_obj = {
                "message": "Text is missing."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        user_id = self.current_user.id
        post_id = body.get("post_id")
        try:
            post_id = int(post_id)
            all_ids = [id for (id,) in Post.query.with_entities(Post.id).all()]
            if post_id not in all_ids:
                response_obj = {
                    "message": "Post id does not exist."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            if not can_view_post(post_id, self.current_user):
                response_obj = {
                    "message": "This post is unauthorized to access."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            comment = Comment(text, user_id, post_id)
            db.session.add(comment)
            db.session.commit()
            return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        except:
            response_obj = {
                "message": "Post id is invalid."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    def delete(self, id):
        # Your code here
        try:
            id = int(id)
            all_ids = [id for (id,) in Comment.query.with_entities(Comment.id).all()]
            if id not in all_ids:
                response_obj = {
                    "message": "Comment id is invalid."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            all_user_ids = [id for (id,) in Comment.query.with_entities(Comment.user_id).filter_by(id=id).all()]
            if self.current_user.id not in all_user_ids:
                response_obj = {
                    "message": "Comment is unauthorized to access."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            Comment.query.filter_by(id=id).delete()
            db.session.commit()
            response_obj = {
                "message": "Comment {0} is successfully deleted.".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=200)
        except:
            response_obj = {
                "message": "Comment id is in invalid format."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
