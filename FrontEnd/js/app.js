// ============================================================
// CONFIGURATION ET INITIALISATION
// ============================================================

// URL de base de l'API backend
const url = "http://localhost:5678/api";

// Initialisation de l'application au chargement de la page
getWorks(); // Récupère et affiche tous les projets
getCategories(); // Charge les catégories pour les filtres
displayAdminMode(); // Active le mode admin si l'utilisateur est connecté
handlePictureSubmit(); // Configure le formulaire d'ajout de photo

// Configuration des boutons de navigation entre les modales
const addPhotoButton = document.querySelector(".add-photo-button");
const backButton = document.querySelector(".js-modal-back");
addPhotoButton.addEventListener("click", toggleModal);
backButton.addEventListener("click", toggleModal);

// ============================================================
// GESTION DES PROJETS (WORKS)
// ============================================================

/**
 * Récupère les projets depuis l'API et les affiche
 * @param {number} filter - ID de catégorie optionnel pour filtrer les projets
 */
async function getWorks(filter) {
  // Vide les galeries avant de les remplir (évite les doublons)
  document.querySelector(".gallery").innerHTML = "";
  document.querySelector(".modal-gallery").innerHTML = "";

  try {
    // Appel API pour récupérer tous les projets
    const response = await fetch(`${url}/works`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    
    // Si un filtre est appliqué, on filtre les résultats par categoryId
    if (filter) {
      const filtered = json.filter((data) => data.categoryId === filter);
      for (let i = 0; i < filtered.length; i++) {
        setFigure(filtered[i]); // Affichage dans la galerie principale
        setFigureModal(filtered[i]); // Affichage dans la modale
      }
    } else {
      // Sinon, on affiche tous les projets
      for (let i = 0; i < json.length; i++) {
        setFigure(json[i]);
        setFigureModal(json[i]);
      }
    }
    
    // Attache les événements de suppression sur toutes les icônes de corbeille
    const trashCans = document.querySelectorAll(".fa-trash-can");
    trashCans.forEach((e) =>
      e.addEventListener("click", (event) => deleteWork(event))
    );
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Crée et affiche un projet dans la galerie principale
 * @param {Object} data - Données du projet (id, imageUrl, title, categoryId)
 */
function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
                    <figcaption>${data.title}</figcaption>`;

  document.querySelector(".gallery").append(figure);
}

/**
 * Crée et affiche un projet dans la modale avec l'icône de suppression
 * @param {Object} data - Données du projet
 */
function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<div class="image-container">
        <img src="${data.imageUrl}" alt="${data.title}">
        <figcaption>${data.title}</figcaption>
        <i id=${data.id} class="fa-solid fa-trash-can overlay-icon"></i>
    </div>
`;

  document.querySelector(".modal-gallery").append(figure);
}

// ============================================================
// GESTION DES CATÉGORIES ET FILTRES
// ============================================================

/**
 * Récupère les catégories depuis l'API et crée les boutons de filtre
 */
async function getCategories() {
  try {
    const response = await fetch(`${url}/categories`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    // Crée un bouton de filtre pour chaque catégorie
    for (let i = 0; i < json.length; i++) {
      setFilter(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Crée un bouton de filtre pour une catégorie
 * @param {Object} data - Données de la catégorie (id, name)
 */
function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  // Au clic, filtre les projets par cette catégorie
  div.addEventListener("click", () => getWorks(data.id));
  // Gère l'état actif du filtre
  div.addEventListener("click", (event) => toggleFilter(event));
  // Configure aussi le bouton "Tous"
  document
    .querySelector(".tous")
    .addEventListener("click", (event) => toggleFilter(event));
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div);
}

/**
 * Gère l'apparence des filtres (active/inactive)
 * @param {Event} event - Événement de clic sur un filtre
 */
function toggleFilter(event) {
  const container = document.querySelector(".div-container");
  // Retire la classe active de tous les filtres
  Array.from(container.children).forEach((child) =>
    child.classList.remove("active-filter")
  );
  // Ajoute la classe active au filtre cliqué
  event.target.classList.add("active-filter");
}

// Configure le bouton "Tous" pour afficher tous les projets
document.querySelector(".tous").addEventListener("click", () => getWorks());

// ============================================================
// MODE ADMINISTRATEUR
// ============================================================

/**
 * Active l'interface administrateur si un token d'authentification est présent
 * Affiche la bannière d'édition, masque les filtres, ajoute le bouton logout
 */
function displayAdminMode() {
  // Vérifie si un token est présent dans sessionStorage
  if (sessionStorage.authToken) {
    // Masque les filtres (non nécessaires en mode admin)
    document.querySelector(".div-container").style.display = "none";
    // Affiche le bouton "Modifier" dans la modale
    document.querySelector(".js-modal-2").style.display = "block";
    // Ajuste la marge de la galerie
    document.querySelector(".gallery").style.margin = "30px 0 0 0";
    
    // Crée la bannière "Mode édition" en haut de page
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML =
      '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i>Mode édition</a></p>';
    document.body.prepend(editBanner);

    // Transforme le lien "login" en "logout"
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", handleLogout);
    }
  }
}

/**
 * Déconnecte l'utilisateur et le redirige vers la page d'accueil
 * @param {Event} event - Événement de clic
 */
function handleLogout(event) {
  event.preventDefault();
  // Supprime le token d'authentification
  sessionStorage.removeItem("authToken");
  // Redirige vers la page d'accueil (mode visiteur)
  window.location.href = "index.html";
}

// ============================================================
// SYSTÈME DE MODALE (ACCESSIBLE)
// ============================================================

// Variables globales pour la gestion des modales
let modal = null; // Référence à la modale actuellement ouverte
const focusableSelector = "button, a, input, textarea"; // Éléments pouvant recevoir le focus
let focusables = []; // Liste des éléments focusables dans la modale

/**
 * Ouvre une modale et configure son accessibilité
 * @param {Event} e - Événement de clic sur le déclencheur
 */
const openModal = function (e) {
  e.preventDefault();
  // Récupère la modale ciblée par le lien (href="#modal1")
  modal = document.querySelector(e.target.getAttribute("href"));
  // Identifie tous les éléments focusables dans la modale
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  // Place le focus sur le premier élément
  focusables[0].focus();
  // Affiche la modale
  modal.style.display = null;
  // Configure les attributs ARIA pour l'accessibilité
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  // Ferme la modale si on clique sur l'overlay
  modal.addEventListener("click", closeModal);
  // Configure les boutons de fermeture
  modal
    .querySelectorAll(".js-modal-close")
    .forEach((e) => e.addEventListener("click", closeModal));
  // Empêche la fermeture si on clique sur le contenu de la modale
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);
};

/**
 * Ferme la modale ouverte et nettoie les événements
 * @param {Event} e - Événement de fermeture
 */
const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  // Masque la modale
  modal.style.display = "none";
  // Restaure les attributs ARIA
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  // Nettoie tous les événements
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

/**
 * Empêche la propagation d'événements (pour éviter la fermeture accidentelle)
 * @param {Event} e - Événement à stopper
 */
const stopPropagation = function (e) {
  e.stopPropagation();
};

/**
 * Gère la navigation au clavier (Tab) dans la modale
 * Permet de "piéger" le focus dans la modale pour l'accessibilité
 * @param {Event} e - Événement clavier
 */
const focusInModal = function (e) {
  e.preventDefault();
  // Trouve l'index de l'élément actuellement focus
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  // Si Shift+Tab, recule dans les éléments
  if (e.shiftKey === true) {
    index--;
  } else {
    // Sinon, avance
    index++;
  }
  // Gère le retour au début/fin de la liste (navigation circulaire)
  if (index >= focusables.length) {
    index = 0;
  }
  if (index < 0) {
    index = focusables.length - 1;
  }
  focusables[index].focus();
};

// Gestion des raccourcis clavier globaux
window.addEventListener("keydown", function (e) {
  // ESC ferme la modale
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
  // Tab gère la navigation dans la modale
  if (e.key === "Tab" && modal !== null) {
    focusInModal(e);
  }
});

// Attache l'événement d'ouverture à tous les liens de modale
document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

// ============================================================
// SUPPRESSION DE PROJETS
// ============================================================

/**
 * Supprime un projet via l'API et rafraîchit l'affichage
 * @param {Event} event - Événement de clic sur l'icône de suppression
 */
async function deleteWork(event) {
  event.stopPropagation(); // Empêche la propagation pour éviter d'autres actions
  const id = event.srcElement.id; // Récupère l'ID du projet depuis l'attribut id de l'icône
  const token = sessionStorage.authToken; // Récupère le token d'authentification
  
  try {
    // Appel API DELETE pour supprimer le projet
    const response = await fetch(`${url}/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token, // Authentification requise
      },
    });

    // Si la suppression a réussi
    if (response.status == 200 || response.status == 204) {
      await getWorks(); // ✅ Rafraîchit l'affichage des projets
      console.log("Photo supprimée avec succès");
    } else if (response.status == 401 || response.status == 500) {
      // Gestion des erreurs d'authentification ou serveur
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.innerHTML = "Il y a eu une erreur";
      document.querySelector(".modal-button-container").prepend(errorBox);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
}

// ============================================================
// NAVIGATION ENTRE MODALES
// ============================================================

/**
 * Bascule entre la modale galerie et la modale d'ajout de photo
 * Utilisé par les boutons "Ajouter une photo" et "Retour"
 */
function toggleModal() {
  const galleryModal = document.querySelector(".gallery-modal");
  const addModal = document.querySelector(".add-modal");

  // Si la modale galerie est visible, affiche la modale d'ajout
  if (
    galleryModal.style.display === "block" ||
    galleryModal.style.display === ""
  ) {
    galleryModal.style.display = "none";
    addModal.style.display = "block";
  } else {
    // Sinon, retourne à la modale galerie
    galleryModal.style.display = "block";
    addModal.style.display = "none";
  }
}

// ============================================================
// AJOUT DE NOUVEAUX PROJETS
// ============================================================

/**
 * Configure le formulaire d'ajout de photo avec :
 * - Prévisualisation de l'image
 * - Validation (format, taille)
 * - Envoi vers l'API
 */
function handlePictureSubmit() {
  const img = document.createElement("img"); // Element pour la prévisualisation
  const fileInput = document.getElementById("file");
  let file; // Variable pour stocker le fichier sélectionné
  
  fileInput.style.display = "none"; // Cache l'input natif (design personnalisé)
  
  // ========== GESTION DE LA SÉLECTION D'IMAGE ==========
  fileInput.addEventListener("change", function (event) {
    file = event.target.files[0];
    const maxFileSize = 4 * 1024 * 1024; // 4 Mo maximum

    // Validation du format et de la taille
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      if (file.size > maxFileSize) {
        alert("La taille de l'image ne doit pas dépasser 4 Mo.");
        return;
      }

      // Prévisualisation de l'image avec FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.alt = "Uploaded Photo";
        document.getElementById("photo-container").appendChild(img);
      };
      reader.readAsDataURL(file);
      
      // Masque les éléments de placeholder (icône, texte)
      document
        .querySelectorAll(".picture-loaded")
        .forEach((e) => (e.style.display = "none"));
    } else {
      alert("Veuillez sélectionner une image au format JPG ou PNG.");
    }
  });

  // ========== GESTION DES CHAMPS DU FORMULAIRE ==========
  const titleInput = document.getElementById("title");
  let titleValue = "";
  let selectedValue = "1"; // Catégorie par défaut

  // Mise à jour de la catégorie sélectionnée
  document.getElementById("category").addEventListener("change", function () {
    selectedValue = this.value;
  });

  // Mise à jour du titre
  titleInput.addEventListener("input", function () {
    titleValue = titleInput.value;
  });

  // ========== SOUMISSION DU FORMULAIRE ==========
  const addPictureForm = document.getElementById("picture-form");

  addPictureForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    
    const hasImage = document.querySelector("#photo-container").firstChild;
    
    // Validation : image + titre obligatoires
    if (hasImage && titleValue) {
      // Création du FormData pour l'envoi multipart/form-data
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", titleValue);
      formData.append("category", selectedValue);

      const token = sessionStorage.authToken;

      if (!token) {
        console.error("Token d'authentification manquant.");
        return;
      }

      // Appel API POST pour créer le nouveau projet
      let response = await fetch(`${url}/works`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token, // Authentification requise
        },
        body: formData,
      });
      
      // Si l'ajout a réussi
      if (response.status === 201) {
        await getWorks(); // ✅ Rafraîchit l'affichage des projets
        console.log("Photo ajoutée avec succès");
        
        // Réinitialisation du formulaire
        addPictureForm.reset();
        document.querySelector("#photo-container").innerHTML = "";
        document.querySelectorAll(".picture-loaded").forEach((e) => (e.style.display = "block"));
        
        // Retour à la modale galerie
        toggleModal();
      } else {
        // Gestion des erreurs
        const errorText = await response.text();
        console.error("Erreur : ", errorText);
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.innerHTML = `Il y a eu une erreur : ${errorText}`;
        document.querySelector("form").prepend(errorBox);
      }
    } else {
      alert("Veuillez remplir tous les champs");
    }
  });
}