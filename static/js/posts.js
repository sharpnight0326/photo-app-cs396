const posts2HTML = post => {
    return `
    <div class="post">
        <div class="post_user_name">
            <p>${post.user.first_name} ${post.user.last_name}</p>
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
        </div>
        <div class="comments ${post.id}">
            <div class="comments-general">
                <button onclick="openModal()">View all ${post.comments.length} comments</button>
            </div>
            <div>
                ${displayComments(post.comments)}      
            </div>
        </div>
        <div>
            ${post.display_time}
        </div>
    </div>
    <div class="add-comment">
        <div style="flex:0 0 90%;" >
            <input class="input ${post.id}" placeholder="Add a comment..." />
        </div>
        <div style="flex: 1;">
            <button class="btn ${post.id}" onclick="addComment(${post.id})">Post</button>
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
            <div><strong>${comments[0].user.username}</strong>${comments[0].text}</div>
            <div>${comments[0].timestamp}</div>
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

const openModal = () => {
    document.querySelector("#posts").innerHTML += `<div style="width: 100vh;height: 100vh;background: white">xxx</div>`
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
        return `<i class="fas fa-bookmark" onclick="toggleBookmark(${post.id}, event)" data-bookmark-id="${post.current_user_bookmark_id}"></i>`
    }
    else {
        return `<i class="far fa-bookmark" onclick="toggleBookmark(${post.id}, event)"></i>`
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
        return `<i class="fas fa-heart" data-post-id="${post.id}" onclick="toggleLike(${post.id}, event)"
            data-like-id="${post.current_user_like_id}"></i>`
    }
    else {
        // console.log(post.likes.length)
        return `<i class="far fa-heart" data-post-id="${post.id}" onclick="toggleLike(${post.id}, event)"></i>`
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