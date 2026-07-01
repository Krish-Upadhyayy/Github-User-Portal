const usernameInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const profileContainer = document.getElementById("profileContainer");
const repoContainer = document.getElementById("repoContainer");
const sortRepos = document.getElementById("sortRepos");
const languageContainer = document.getElementById("languageContainer");
let allRepos = [];

searchBtn.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    if (username === "") {
        errorMessage.textContent = "Please enter a username";
        return;
    }

    console.log("Searching for:", username);
    fetchUser(username);

});

async function fetchUser(username) {
    languageContainer.innerHTML = "";
    loadingMessage.textContent = "🔄 Fetching GitHub data..."; 
    errorMessage.textContent = "";
    profileContainer.innerHTML = "";
    repoContainer.innerHTML = "";

    try{ 
        const [userRes, repoRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
        ]);
    if (userRes.status === 404) {
        loadingMessage.textContent = "";
        errorMessage.textContent = "User not found";
        profileContainer.innerHTML = "";
        return;
    }
    const user = await userRes.json();
    const repos = await repoRes.json();
    loadingMessage.textContent = "";

    allRepos = repos;
        renderProfile(user);
        renderRepos(allRepos);
        renderLanguages(allRepos);
}
    catch(error){
    loadingMessage.textContent = "";
    errorMessage.textContent = "Unable to connect to GitHub. Please try again.";
    profileContainer.innerHTML = "";     
    }
}
function renderProfile(user) {
    profileContainer.innerHTML = `
        <img src="${user.avatar_url}" alt="avatar" width="120">
        <h3>${user.name || user.login}</h3>
        <p>${user.bio || "No bio available"}</p>
        <p><strong>Followers:</strong> ${user.followers}</p>
        <p><strong>Following:</strong> ${user.following}</p>
        <p><strong>Public Repositories:</strong> ${user.public_repos}</p>
        <p><strong>Location:</strong> ${user.location || "No Location Available"}</p>
        <p><strong>GitHub Profile Link: </strong><a href="${user.html_url}" target="_blank">Visit Profile</a></p>
    `;
}

function renderRepos(repos) {
    repoContainer.innerHTML = "";
    if (repos.length === 0) {
    repoContainer.innerHTML = "<p>No repositories found</p>";
    return;
}
    repos.forEach(repo => {
        const repoCard = document.createElement("div");
        repoCard.classList.add("repo-card");

        repoCard.innerHTML = `
            <h4>${repo.name}</h4>
            <p>${repo.description || "No description"}</p>
            <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
            <p>Language: ${repo.language || "N/A"}</p>
            <p>Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
            <a href="${repo.html_url}" target="_blank">View Repo</a>
        `;
        repoContainer.appendChild(repoCard);
    });
}
//sort
sortRepos.addEventListener("change", function () {
    sortAndRender();
});

function sortAndRender() {
    const value = sortRepos.value;
    let sortedRepos = [...allRepos];

    switch (value) {
        case "stars":
            sortedRepos.sort((a, b) =>
                b.stargazers_count - a.stargazers_count
            );
            break;

        case "updated":
            sortedRepos.sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );
            break;

        case "name":
            sortedRepos.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;
    }

    renderRepos(sortedRepos);
}

function renderLanguages(repos) {
    const langCount = {};

    repos.forEach(repo => {
        const lang = repo.language;
        if (!lang) return;
        langCount[lang] = (langCount[lang] || 0) + 1;
    });

    const total = Object.values(langCount).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
    languageContainer.innerHTML = "<p>No language data available</p>";
    return;
}

    const langPercent = Object.entries(langCount).map(([lang, count]) => {
        return {
        language: lang,
        percent: ((count / total) * 100).toFixed(1)
        };
    });
    languageContainer.innerHTML = "";
    langPercent.forEach(item => {

        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "12px";

        wrapper.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <strong>${item.language}</strong>
                <span>${item.percent}%</span>
            </div>

            <div style="
                width:100%;
                height:8px;
                background:#e5e7eb;
                border-radius:5px;
                overflow:hidden;
                margin-top:5px;
            ">
                <div style="
                    width:${item.percent}%;
                    height:100%;
                    background:#24292e;
                "></div>
            </div>
        `;

        languageContainer.appendChild(wrapper);
    });
}

