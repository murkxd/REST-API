let token = null;

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            toggleSections();
            loadPosts();
        } else {
            alert("Login failed");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

function logout() {
    token = null;
    document.getElementById("posts-container").innerHTML = "";
    toggleSections();
}

async function loadPosts() {
    try {
        const response = await fetch("/blog", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else {
            alert("Loading posts failed.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "";

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <h3>${post.author}</h3>
            <p>${post.content}</p>
            <small>Posted on: ${new Date(post.createdAt).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postElement);
    });
}

function toggleSections() {
    document.getElementById("auth-section").style.display = token ? "none" : "block";
    document.getElementById("posts-section").style.display = token ? "block" : "none";
}

function clearInputs() {
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("reg-username").value = "";
  document.getElementById("reg-password").value = "";
}

function toggleForms() {
  document.getElementById("login-form").classList.toggle("active-form");
  document.getElementById("register-form").classList.toggle("active-form");

  clearInputs();
}