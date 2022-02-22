const posts2HTML = post => {
    return `
    <div class="post">
        <div class="post_user_name">
            <p>${post.user.first_name} ${post.user.last_name}</p>
        </div>
        <img src="${post.image_url}">
        <div class="post-operation">
            <div class="like">
                <i class="far fa-heart" data-post-id="${post.id}"
                onclick="toggleLike(${post.likes.length}, event)"></i>
            </div>
            <div class="message" style="margin-left: 1em">
                <i class="far fa-comment"></i>
            </div>
            <div class="forward" style="margin-left: 1em">
                <i class="far fa-paper-plane"></i>
            </div>
            <div class="mark" style="margin-right: 1em; margin-left: auto" >
                <i class="far fa-bookmark" onclick="toggleBookmark(${post.id}, event)"></i>
            </div>
        </div>
        <div class="likes ${post.id}">
            ${post.likes.length} likes
        </div>
        <div class="caption">
            <p><strong>${post.user.username}</strong> ${post.caption}</p>
        </div>
        <div class="comments-general">
            <p>View all ${post.comments.length} comments</p>
        </div>
        <div>
           <p> 
            <strong>${post.comments.length!==0?post.comments[0].user.username:""}</strong>
            ${post.comments.length!==0?post.comments[0].text:""}
           </p>
        </div>
        <div>
            ${post.display_time}
        </div>
    </div>
    <div class="add-comment">
        <div style="flex:0 0 90%;">Add a comment...</div>
        <div style="flex: 1;">
            Post
        </div>
    </div>
    `
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
            document.querySelector("#posts").innerHTML = html
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

const toggleLike = (likeLength, ev) =>{
    const elem = ev.currentTarget;
    if (elem.classList.contains("far")){
        postLike(likeLength, elem)
    }
    else {
        deleteLike(likeLength, elem)
    }

}

const postLike = (likeLength, elem) =>{
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
            document.querySelector("[class=" + CSS.escape(classLikesName) + "]").innerHTML = `${likeLength+1} likes`
        });

}

const deleteLike = (likeLength, elem) =>{
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
            document.querySelector("[class=" + CSS.escape(classLikesName) + "]").innerHTML = `${likeLength} likes`
        });
}

getPosts()