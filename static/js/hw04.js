const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

const initPage = () => {
    displayStories();
};

// invoke init page to display stories:
initPage();

const posts2HTML = post => {
    return `
    <div class="post">
        <div class="post_user_name">
            <strong>${post.user.first_name} ${post.user.last_name}</strong>
        </div>
        <img src="${post.image_url}">
        <div class="post-operation">
            <div class="like">
                ${displayLikes(post)}
            </div>
            <div class="message" style="margin-left: 1em">
                <i class="far fa-comment"></i>
            </div>
            <div class="forward" style="margin-left: 1em">
                <i class="far fa-paper-plane"></i>
            </div>
            <div class="mark" style="margin-right: 1em; margin-left: auto" >
                ${displayBookmark(post)}
            </div>
        </div>
        <div class="likes ${post.id}">
            ${post.likes.length} likes
        </div>
        <div class="caption">
            <p><strong>${post.user.username}</strong> ${post.caption}</p>
            <p style="color: #777777">${post.display_time}</p>
        </div>
<!--        <div style="color: #777777; margin-top: 0px">-->
<!--            -->
<!--        </div>-->
        <div class="comments ${post.id}">
            <div class="comments-general">
                <button data-action="viewbtn" class="viewcomments ${post.id}" data-postid="${post.id}" tabindex="0" onclick="openModal(${post.id}, event)">View all ${post.comments.length} comments</button>
            </div>
            <div>
                ${displayComments(post.comments)}      
            </div>
        </div>
    </div>
    <div class="add-comment">
        <div style="flex:0 0 90%;" >
            <input class="input ${post.id}" placeholder="Add a comment..." />
        </div>
        <div style="flex: 1;">
            <button class="btn ${post.id}" data-action="postbtn" data-postid="${post.id}" tabindex="0" onclick="addComment(${post.id})" style="border: none; color: cornflowerblue; background: white">Post</button>
        </div>
    </div>
    `
}
// <p>
//  <strong>${post.comments.length!==0?post.comments[0].user.username:""}</strong>
//  ${post.comments.length!==0?post.comments[0].text:""}
// </p>

const displayComments = comments =>{
    if (comments && comments.length > 0) {
        return `
            <div><strong>${comments[0].user.username}</strong> ${comments[0].text}</div>
            <div style="color: #777777">${comments[0].timestamp}</div>
        `
    }
    else return `<div></div>`
}

const addComment = postId =>{
    const inputClassName = `input ${postId}`
    const commentsClassName = `comments ${postId}`
    const inputComment = document.querySelector("[class=" + CSS.escape(inputClassName) + "]").value
    fetch("/api/profile", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            document.querySelector('[class=' + CSS.escape(commentsClassName) + ']').innerHTML += `<div>
                <strong>${data.username}</strong>
                ${inputComment}
            </div>`
            console.log(data)
        });

    const postData = {
        "post_id": postId,
        "text": inputComment
    };
    fetch("/api/comments", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
    // console.log(comment)
}

var postsDiv = document.getElementById("posts");
postsDiv.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
        if (event.target.dataset.action==="postbtn") {
            event.preventDefault();
            addComment(event.target.dataset.postid)
        }
    }
});
postsDiv.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
        if (event.target.dataset.action==="viewbtn") {
            event.preventDefault();
            openModal(event.target.dataset.postid, event)
        }
    }
});

const openModal = (postId, ev) => {
    fetch(`api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const html = `
                <div class="modal-bg" tabindex="1">
                    <button autofocus="autofocus" onclick="destroyModal(${postId}, event)" tabindex="99" data-action="closebtn" id="close" data-postId="${post.id}">Close</button>
                    <div class="modal">
                        <img src="${post.image_url}">
                        <div style="overflow: scroll">${post.comments.map(comment2HTML).join('\n')}</div>
                    </div>
                </div>
    `
            document.querySelector("#modal-container").innerHTML = html;
            document.getElementById("posts").disabled = true;
        })
        .then(data=> {
                document.querySelector("#close").focus();
            }
        )

}

postsDiv.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
        if (event.target.dataset.action==="closebtn") {
            event.preventDefault();
            destroyModal(event.target.dataset.postId, event)
        }
    }
});
window.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        if (document.querySelector(".modal-bg")) {
            event.preventDefault();
            // console.log(event.target)
            destroyModal(event.target.dataset.postid, event)
        }
    }
});

const comment2HTML = comment =>{
    return `<div id="modal-comments">
                <div><img src="${comment.user.thumb_url}" style="border-radius: 50%"></div>
                <div style="margin-left: 1%">
                    <strong>${comment.user.username} </strong>
                    ${comment.text}
                    <br><strong>${comment.timestamp}</strong>
                </div>
                <div style="margin-left: auto; margin-right: 0px">
                    <i class="far fa-heart"></i>
                </div>
   
            </div>
            `
}

const destroyModal = (postId, ev) =>{
    document.querySelector("#modal-container").innerHTML = "";
    const viewCommentsClassName = `viewcomments ${postId}`
    document.querySelector("[class=" + CSS.escape(viewCommentsClassName) + "]").focus()

}

const getPosts = () =>{
    fetch("/api/posts/", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(posts2HTML).join('\n');
            document.querySelector("#posts").innerHTML += html
            console.log(posts);
        });
}

const toggleBookmark = (postId, ev) =>{
    const elem = ev.currentTarget;
    if (elem.classList.contains("far")){
        postBookmark(postId, elem)
    }
    else {
        deleteBookmark(elem)
    }
}

const displayBookmark = post =>{
    if (post.current_user_bookmark_id){
        return `<div aria-label="button" aria-checked="true"><i class="fas fa-bookmark" onclick="toggleBookmark(${post.id}, event)" data-bookmark-id="${post.current_user_bookmark_id}"></i></div>`
    }
    else {
        return `<div aria-label="button" aria-checked="false"><i class="far fa-bookmark" onclick="toggleBookmark(${post.id}, event)"></i></div>`
    }
}

const postBookmark = (postId, elem) => {
    const postData = {
        "post_id": postId
    };

    fetch("/api/bookmarks/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("far")
            elem.classList.add("fas")
            elem.setAttribute("data-bookmark-id", data.id)
        });
}

const deleteBookmark = (elem) => {
    fetch(`/api/bookmarks/${elem.dataset.bookmarkId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("fas")
            elem.classList.add("far")
        });
}

const toggleLike = (postId, ev) =>{
    const elem = ev.currentTarget;
    if (elem.classList.contains("far")){
        postLike(postId, elem)
    }
    else {
        deleteLike(postId, elem)
    }

}

const displayLikes = post =>{
    // console.log(post.likes.length)
    if (post.current_user_like_id) {
        // console.log(post.likes.length)
        return `<div aria-label="button" aria-checked="true"><i class="fas fa-heart liked" aria-label="red-heart" data-post-id="${post.id}" onclick="toggleLike(${post.id}, event)"
            data-like-id="${post.current_user_like_id}"></i></div>`
    }
    else {
        // console.log(post.likes.length)
        return `<div aria-label="button" aria-checked="false"><i class="far fa-heart" aria-label="hallow-heart" data-post-id="${post.id}" onclick="toggleLike(${post.id}, event)"></i></div>`
    }
}

const postLike = (postId, elem) =>{
    const postData = {
        // userId: `${user.id}`
    }
    fetch(`/api/posts/${elem.dataset.postId}/likes/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("far")
            elem.classList.add("fas")
            elem.classList.add("liked")
            elem.setAttribute("data-like-id", data.id)

            var classLikesName = `likes ${elem.dataset.postId}`
            fetch(`http://127.0.0.1:5000/api/posts/${elem.dataset.postId}`)
                .then(response => response.json())
                .then(data => {
                    document.querySelector("[class=" + CSS.escape(classLikesName) + "]").innerHTML = `${data.likes.length} likes`
                    // console.log(data)
                });
        });

}

const deleteLike = (postId, elem) =>{
    fetch(`/api/posts/${elem.dataset.postId}/likes/${elem.dataset.likeId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("liked")
            elem.classList.remove("fas")
            elem.classList.add("far")
            var classLikesName = `likes ${elem.dataset.postId}`
            fetch(`/api/posts/${postId}`)
                .then(response => response.json())
                .then(data => {
                    document.querySelector("[class=" + CSS.escape(classLikesName) + "]").innerHTML = `${data.likes.length} likes`
                });
            // document.querySelector("[class=" + CSS.escape(classLikesName) + "]").innerHTML = `${likeLength} likes`
        });
}

getPosts()


const user2Html = user => {
    return `
    <div class="suggestion">
        <img src="${user.thumb_url}">
            <div>
                <p class="username">${user.username}</p>
                <p class="suggestion-text">Suggested for you</p>
            </div>
            <div>
                <button aria-label="button" class="follow" style="border: none;color: cornflowerblue" data-action="suggestfollowbtn" data-user-id="${user.id}" tabindex="0">follow</button>
            </div>
    </div>
    `
}

var suggestionsDiv = document.getElementById("suggestions");
suggestionsDiv.addEventListener("click", function(event) {
    if (event.target.dataset.action==="suggestfollowbtn") {
        event.preventDefault();
        if (event.target.innerHTML==="follow"){
            // console.log(elem.dataset.userId)
            createFollowing(event.target.dataset.userId, event.target)
        }
        else {
            deleteFollowing(event.target.dataset.followingId, event.target)
        }
    }

});
suggestionsDiv.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
        if (event.target.dataset.action==="suggestfollowbtn") {
            event.preventDefault();
            if (event.target.innerHTML==="follow"){
                // console.log(elem.dataset.userId)
                createFollowing(event.target.dataset.userId, event.target)
            }
            else {
                deleteFollowing(event.target.dataset.followingId, event.target)
            }
        }
    }
});

const createFollowing = (userId, elem) => {
    console.log(userId)
    const postData = {
        "user_id": userId
    };

    fetch("/api/following/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            elem.innerHTML = "unfollow"
            elem.classList.add("unfollow")
            elem.classList.remove("follow")
            elem.style.background="white"
            elem.style.border="solid"
            elem.setAttribute("aria-checked", true)
            elem.setAttribute("data-following-id", data.id)
            console.log(data)
        });
}

const deleteFollowing = (followingId, elem) =>{
    const deleteURL =`/api/following/${followingId}`
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            elem.innerHTML = "follow"
            elem.classList.add("follow")
            elem.classList.remove("unfollow")
            elem.style.background="none"
            elem.style.border="none"
            elem.removeAttribute(elem.dataset.followingId)
            elem.setAttribute("aria-checked", false)
            console.log(data);
        });
}

const getUsers = () => {
    fetch("http://127.0.0.1:5000/api/suggestions")
        .then(response => response.json())
        .then(users => {
            const html = users.map(user2Html).join('\n');
            document.querySelector("#suggestions").innerHTML = html
            console.log(users)
        })
}

getUsers()