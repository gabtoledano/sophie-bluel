async function getWorks(filter) {
  document.querySelector(".gallery").innerHTML = "";
  const url = "http://localhost:5678/api/works";
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des works");
    }
    const json = await reponse.json();
    if (filter) {
      const filtered = json.filter((data) => data.categoryId === filter);
      for (let i = 0; i < filtered.length; i++) {
        setFigure(filtered[i]);
      }
    } else {
      for (let i = 0; i < json.length; i++) {
        setFigure(json[i]);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}
getWorks();

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
							<figcaption>${data.title}</figcaption>`;
  document.querySelector(".gallery").append(figure);
}

async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }

    const json = await reponse.json();
    for (let i = 0; i < json.length; i++) {
      setFilter(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
}
getCategories();

function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  div.addEventListener("click", () => getWorks(data.id));
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div);
}

document.querySelector(".tous").addEventListener("click", () => getWorks());

function displayAdminMode() {
  if (sessionStorage.authToken) {
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML =
      '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i>Mode édition</a></p>';
    document.body.prepend(editBanner);

    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", handleLogout);
    }
  }
}

function handleLogout(event) {
  event.preventDefault();
  sessionStorage.removeItem("authToken");
  window.location.href = "index.html";
}

displayAdminMode();

const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute("href"));
  target.style.display = null;
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});
