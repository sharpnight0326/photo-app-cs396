from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db, Post
import json
from . import can_view_post

class BookmarksListEndpoint(Resource):
#    List all of bookmarks
#    Create a new bookmark

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
#     Show only the bookmarks that are associated with the user
#     Approach:
#       1. use SQL Alchemy to execute the query using the "Bookmark" model (from Model folder)
#       2. return the serialized list using Json
        # Your code here
        bookmarks = Bookmark.query.filter_by(user_id=self.current_user.id).all()

        bookmarks_dict = [
            bookmark.to_dict() for bookmark in bookmarks
        ]
#         for item in bookmarks_dict:
#             print(item.get("id"))

        return Response(json.dumps(bookmarks_dict), mimetype="application/json", status=200)


    def post(self):
#     1. Get the post_id from the request body
#     2. check that the user is authorized to bookmark the post
#     3. check that the post_id exists and is valid
#     4. If 1, 2 & 3, insert it into the database
#     5. Return the new bookmarked post (and the bookmark id) to the user response
        # Your code here
        try:
            body = request.get_json()
            if body is None or body.get("post_id") is None:
                response_obj = {
                    "message": "The post id is missing."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=400)
            post_id = body.get("post_id")
            try:
                post_id = int(post_id)
            except:
                response_obj = {
                    "message": "The id is in invalid format."
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=400)
            post_list = [id for (id,) in Post.query.with_entities(Post.id).all()]

            if post_id in post_list:
                if can_view_post(post_id, self.current_user):
                    bookmark = Bookmark(self.current_user.id, post_id)
                    db.session.add(bookmark)
                    db.session.commit()
                    return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)
                else:
                    response_obj = {
                        "message": "You have no access to Post {0}".format(post_id)
                    }
                    return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            else:
                response_obj = {
                    'message': "the post id does not exist.",
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)

        except:
             import sys
             db_message = str(sys.exc_info()[1]) # stores DB error message
             print(db_message)                   # logs it to the console
             message = 'Database Insert error. Make sure your post data is valid.'
             post_data = request.get_json()
             post_data['user_id'] = self.current_user.id
             response_obj = {
                 'message': message,
                 'db_message': db_message,
                 'post_data': post_data
             }
             return Response(json.dumps(response_obj), mimetype="application/json", status=400)


class BookmarkDetailEndpoint(Resource):
#    PATCH (for updating), GET (Individual bookmark), DELETE (individual bookmark)
#    Create a new bookmark

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here
        try:
            id = int(id)
            id_list = [ids for (ids,) in Bookmark.query.with_entities(Bookmark.id).all()]
            user_id = [pid for (pid,) in Bookmark.query.with_entities(Bookmark.user_id).filter(Bookmark.id==id).all()]

            if id in id_list:
                if user_id[0] != self.current_user.id:
                    return Response(json.dumps({}), mimetype="application/json", status=404)
                Bookmark.query.filter_by(id=id).delete()
                db.session.commit()
                response_obj = {
                    "message": "Post {0} successfully deleted".format(id)
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=200)
            else:
                response_obj = {
                    "message": "Post {0} does not exist.".format(id)
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)

        except:
            response_obj = {
                "message": "The post id is in invalid format."
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
