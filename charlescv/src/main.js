// src/main.js

const users = [
  {
    name: "Paris Saint-Germain",
    job: "Club de Ligue 1 basé à Paris",
    avatar: "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a7/Logo_Paris_Saint-Germain.svg/1200px-Logo_Paris_Saint-Germain.svg.png"
  },
  {
    name: "Real Madrid",
    job: "Club de La Liga basé à Madrid",
    avatar: "https://upload.wikimedia.org/wikipedia/fr/thumb/5/56/Real_Madrid_CF.svg/langfr-280px-Real_Madrid_CF.svg.png"
  },
  {
    name: "Liverpool FC",
    job: "Club de Premier League basé à Liverpool",
    avatar: "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0c/Logo_Liverpool_FC.svg/1200px-Logo_Liverpool_FC.svg.png"
  }
];

const userList = document.getElementById("user-list");

function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center";
  card.innerHTML = `
    <img class="w-24 h-24 mb-4" src="${user.avatar}" alt="Logo de ${user.name}" />
    <h2 class="text-lg font-semibold">${user.name}</h2>
    <p class="text-gray-500 mb-4">${user.job}</p>
    <button class="follow-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Suivre</button>
  `;

  const btn = card.querySelector(".follow-btn");
  btn.addEventListener("click", () => {
    btn.textContent = "Abonné ✅";
    btn.classList.remove("bg-blue-500", "hover:bg-blue-600");
    btn.classList.add("bg-green-500");
  });

  return card;
}

users.forEach(user => {
  userList.appendChild(createUserCard(user));
});
