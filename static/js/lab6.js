
const toggleFollow = ev => {
    console.log(ev)
    const elem = ev.currentTarget
    console.log(elem.innerHTML)
    console.log(elem.dataset.userId)
    if (elem.innerHTML==="follow"){
        createFollowing(elem.dataset.userId, elem)
    }
    else {
        deleteFollowing(elem.dataset.followingId, elem)
    }
}

const user2Html = user => {
    return `
    <div class="suggestion">
        <img src="${user.thumb_url}">
            <div>
                <p class="username">${user.username}</p>
                <p class="suggestion-text">Suggested for you</p>
            </div>
            <div>
                <button class="follow" data-user-id="${user.id}" onclick="toggleFollow(event)">follow</button>
            </div>
    </div>
    `
}

const createFollowing = (userId, elem) => {
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
            elem.removeAttribute(elem.dataset.followingId)
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