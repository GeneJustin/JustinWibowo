const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOInqUnXNTARcOtH4H_IHla_DFBn_LpOOaeCq06Lyb8-_8um4hy2_ScDz45YzvCMs2ZRJpE48mC4gV/pub?output=csv";

const experienceUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOInqUnXNTARcOtH4H_IHla_DFBn_LpOOaeCq06Lyb8-_8um4hy2_ScDz45YzvCMs2ZRJpE48mC4gV/pub?output=csv&gid=1367473316";

const activityUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOInqUnXNTARcOtH4H_IHla_DFBn_LpOOaeCq06Lyb8-_8um4hy2_ScDz45YzvCMs2ZRJpE48mC4gV/pub?output=csv&gid=1319473335";

const MAX_ITEMS = 8;

let projects = [];
let experiences = [];
let activities = [];

let currentType = "All";

let projectExpanded = false;
let experienceExpanded = false;
let activityExpanded = false;

async function getData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Gagal mengambil Google Sheet");
    }

    const text = await response.text();

    const rows = [];
    let row = [];
    let value = "";
    let quote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (quote && text[i + 1] === '"') {
                value += '"';
                i++;
            } else {
                quote = !quote;
            }
        } else if (char === "," && !quote) {
            row.push(value.trim());
            value = "";
        } else if ((char === "\n" || char === "\r") && !quote) {
            if (char === "\r" && text[i + 1] === "\n") {
                i++;
            }

            row.push(value.trim());

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        } else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value.trim());
        rows.push(row);
    }

    const headers = rows[0].map(header =>
        header.replace(/^"|"$/g, "").trim().toLowerCase()
    );

    return rows.slice(1).map(row => {
        const data = {};

        headers.forEach((header, index) => {
            data[header] = (row[index] || "")
                .replace(/^"|"$/g, "")
                .trim();
        });

        return data;
    });
}

async function getProjects() {
    try {
        projects = await getData(sheetUrl);

        console.log("Projects:", projects);

        displayProjects();

    } catch (error) {
        console.error("Projects:", error);
    }
}

async function getExperience() {
    try {
        experiences = await getData(experienceUrl);

        console.log("Experience:", experiences);

        displayExperience();

    } catch (error) {
        console.error("Experience:", error);
    }
}

async function getActivities() {
    try {
        activities = await getData(activityUrl);

        console.log("Activities:", activities);

        displayActivities();

    } catch (error) {
        console.error("Activities:", error);
    }
}

function displayProjects() {
    const container = document.getElementById("projects");
    const buttonContainer = document.getElementById("projectViewMore");

    container.innerHTML = "";
    buttonContainer.innerHTML = "";

    const filtered = projects.filter(project => {
        if (currentType === "All") {
            return true;
        }

        return project.type.toLowerCase() === currentType.toLowerCase();
    });

    const visibleProjects = projectExpanded
        ? filtered
        : filtered.slice(0, MAX_ITEMS);

    visibleProjects.forEach(project => {
        const card = document.createElement("div");

        card.className = "project";

        const image = project.image;
        const title = project.title;
        const description = project.description;
        const type = project.type;
        const github = project.github;
        const url = project.url;
        const tech = project.tech;

        const techList = tech
            .split(".")
            .map(item => item.trim())
            .filter(item => item !== "");

        card.innerHTML = `
            <img class="projectImage" src="${image}" alt="${title}">

            <div class="projectBody">
                <div class="projectType">${type}</div>

                <h3 class="projectTitle">${title}</h3>

                <p class="projectDescription">
                    ${description}
                </p>

                <div class="tech">
                    ${techList.map(item => `<span>${item}</span>`).join("")}
                </div>

                <div class="projectLinks">
                    ${url && url !== "-" ? `<a href="${url}" target="_blank">WEB</a>` : ""}
                    ${github && github !== "-" ? `<a href="${github}" target="_blank">GITHUB</a>` : ""}
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    if (filtered.length > MAX_ITEMS) {
        const button = document.createElement("button");

        button.className = "viewMore";
        button.textContent = projectExpanded ? "VIEW LESS" : "VIEW MORE";

        button.addEventListener("click", () => {
            projectExpanded = !projectExpanded;
            displayProjects();
        });

        buttonContainer.appendChild(button);
    }
}

function displayExperience() {
    const container = document.getElementById("experienceList");
    const buttonContainer = document.getElementById("experienceViewMore");

    if (!container) {
        return;
    }

    container.innerHTML = "";
    buttonContainer.innerHTML = "";

    const visibleExperiences = experienceExpanded
        ? experiences
        : experiences.slice(0, MAX_ITEMS);

    visibleExperiences.forEach(experience => {
        const card = document.createElement("div");

        card.className = "experienceCard";

        const image = experience.url;

        card.innerHTML = `
            <img class="experienceImage" src="${image}" alt="${experience.role}">

            <div class="experienceBody">
                <div class="experiencePeriod">
                    ${experience.period}
                </div>

                <h3 class="experienceRole">
                    ${experience.role}
                </h3>

                <div class="experiencePlace">
                    ${experience.place}
                </div>

                <p class="experienceDescription">
                    ${experience.description}
                </p>
            </div>
        `;

        container.appendChild(card);
    });

    if (experiences.length > MAX_ITEMS) {
        const button = document.createElement("button");

        button.className = "viewMore";
        button.textContent = experienceExpanded ? "VIEW LESS" : "VIEW MORE";

        button.addEventListener("click", () => {
            experienceExpanded = !experienceExpanded;
            displayExperience();
        });

        buttonContainer.appendChild(button);
    }
}

function displayActivities() {
    const container = document.getElementById("activityList");
    const buttonContainer = document.getElementById("activityViewMore");

    if (!container) {
        return;
    }

    container.innerHTML = "";
    buttonContainer.innerHTML = "";

    const visibleActivities = activityExpanded
        ? activities
        : activities.slice(0, MAX_ITEMS);

    visibleActivities.forEach(activity => {
        const card = document.createElement("div");

        card.className = "activityCard";

        const image = activity.url;

        card.innerHTML = `
            <img class="activityImage" src="${image}" alt="${activity.role}">

            <div class="activityBody">
                <div class="activityPeriod">
                    ${activity.period}
                </div>

                <h3 class="activityRole">
                    ${activity.role}
                </h3>

                <div class="activityPlace">
                    ${activity.place}
                </div>

                <p class="activityDescription">
                    ${activity.description}
                </p>
            </div>
        `;

        container.appendChild(card);
    });

    if (activities.length > MAX_ITEMS) {
        const button = document.createElement("button");

        button.className = "viewMore";
        button.textContent = activityExpanded ? "VIEW LESS" : "VIEW MORE";

        button.addEventListener("click", () => {
            activityExpanded = !activityExpanded;
            displayActivities();
        });

        buttonContainer.appendChild(button);
    }
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        const active = document.querySelector(".filter.active");

        if (active) {
            active.classList.remove("active");
        }

        button.classList.add("active");

        currentType = button.dataset.type;

        projectExpanded = false;

        displayProjects();
    });
});

getProjects();
getExperience();
getActivities();