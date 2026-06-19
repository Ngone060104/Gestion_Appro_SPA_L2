import { showToast } from "./components/toast.js";
import { renderCategoriesPage } from "./pages/categoriesPage.js";
import { renderProduitsPage } from "./pages/ProduitsPage.js";

const routes = {
  categories: renderCategoriesPage,
  produits: renderProduitsPage,
};

const titles = {
  categories: "Catégories",
  produits: "Produits",
};

export async function navigate(page = "categories") {
  const app = document.getElementById("app");
  const route = routes[page] || routes.categories;

  // 1. Gestion propre de l'URL
  if (page === "categories") {
    // Si c'est la page par défaut, on laisse l'URL d'origine (index.html)
    // window.location.pathname : Donne le chemin du fichier (ex: /index.html).
    // La condition : On vérifie si la page demandée est "categories"
    // L'action : On utilise pushState pour nettoyer l'URL
    // window.location.pathname donne uniquement le chemin de base (ici /index.html), en ignorant tout ce qui vient après.
    // Le résultat : Si l'URL était index.html?page=produits et que vous cliquez sur Catégories,
    //  l'URL redevient proprement index.html. Le paramètre ?page=... est effacé visuellement, mais la page ne se recharge pas
    // La méthode window.history.pushState() permet de modifier l'URL affichée dans le navigateur et d'ajouter une nouvelle entrée dans l'historique, sans provoquer le rechargement de la page
    // window.history.pushState({ page }, "", window.location.pathname);
  } else {
    // Pour les autres pages (ex: produits), on ajoute ?page=produits
    const newUrl = `${window.location.pathname}?page=${page}`;
    window.history.pushState({ page }, "", newUrl);
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    const isActive = button.dataset.page === page;
    button.classList.toggle("bg-slate-950", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-lg", isActive);
    button.classList.toggle("shadow-slate-200", isActive);
    button.classList.toggle("text-slate-600", !isActive);
    button.classList.toggle("hover:bg-slate-100", !isActive);
    button.classList.toggle("hover:text-slate-950", !isActive);
  });

  const navbarTitle = document.getElementById("navbarTitle");
  if (navbarTitle) {
    navbarTitle.textContent = titles[page] || titles.categories;
  }

  app.innerHTML = `
    <div class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div>
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
      </div>
    </div>
  `;

  try {
    await route();
  } catch (error) {
    app.innerHTML = `
      <section class="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-slate-950">Erreur de chargement</h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">${error.message}</p>
        <p class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Vérifie que JSON Server est bien lancé avec :
          <strong class="font-black text-slate-950">npx json-server db.json --port 3000</strong>
        </p>
      </section>
    `;
    showToast(error.message, "error");
  }
}

// 2. Gestion du chargement initial (lit l'URL au rafraîchissement)
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page") || "categories"; // "categories" par défaut si vide
  navigate(pageParam);
});

// 3. Gestion des boutons Retour / Suivant du navigateur
window.addEventListener("popstate", (event) => {
  const page = (event.state && event.state.page) || "categories";
  navigate(page);
});


// Voici l'explication détaillée de ces deux blocs. Ils servent à gérer la vie de votre application en dehors des clics directs : quand on recharge la page ou quand on utilise l'historique du navigateur.
// ------------------------------
// ## Part 2 : DOMContentLoaded (Le rafraîchissement ou premier chargement)

// window.addEventListe ner("DOMContentLoaded", () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const pageParam = urlParams.get("page") || "categories";
//   navigate(pageParam);
// });

// Ce bloc s'exécute une seule fois, dès que le fichier HTML est totalement chargé par le navigateur.

//    1. new URLSearchParams(window.location.search) :
//    * window.location.search récupère la partie après le point d'interrogation de l'URL actuelle (par exemple : ?page=produits).
//       * URLSearchParams est un outil JavaScript qui transforme ce texte en un objet facile à manipuler.
//    2. urlParams.get("page") :
//    * Va chercher la valeur associée à la clé "page". Si l'URL contient ?page=produits, cette fonction renvoie textuellement "produits".
//    3. || "categories" (L'opérateur de secours/fallback) :
//    * Si l'URL n'a pas de paramètre (juste index.html), urlParams.get("page") renvoie null. L'opérateur || dit alors : "Si c'est vide ou null, prends la valeur par défaut "categories"".
//    4. navigate(pageParam) :
//    * Appelle votre fonction principale pour charger visuellement la bonne page (Catégories ou Produits) dès l'ouverture du site.
   
// ------------------------------
// ## Part 3 : popstate (Les flèches Précédent / Suivant)

// window.addEventListener("popstate", (event) => {
//   const page = (event.state && event.state.page) || "categories";
//   navigate(page);
// });

// Ce bloc s'exécute chaque fois que l'utilisateur clique sur la flèche "Retour" ou "Suivant" de son navigateur.

//    1. event.state :
//    * Vous vous rappelez du tout premier paramètre { page } qu'on transmettait à window.history.pushState ? Le navigateur l'a stocké dans son historique. Quand on recule d'une page, le navigateur nous redonne cet objet exact via event.state.
//    2. (event.state && event.state.page) :
//    * C'est une sécurité. On vérifie d'abord si event.state existe (si on a bien stocké quelque chose dedans), et si oui, on récupère la propriété .page (qui contient "produits" ou "categories").
//    3. || "categories" :
//    * Si l'utilisateur recule jusqu'au tout premier chargement de la page (où aucun pushState n'avait encore été fait), event.state sera null. Dans ce cas, on retombe par sécurité sur la page "categories".
//    4. navigate(page) :
//    * Met à jour l'affichage de l'écran pour que le visuel corresponde à l'ancienne URL sur laquelle l'utilisateur vient de revenir.
   
// ------------------------------
// ## En résumé : Pourquoi ces deux blocs sont indispensables ?
// Sans le bloc 2, si vous êtes sur la page Produits (index.html?page=produits) et que vous appuyez sur la touche F5 (rafraîchir), votre application oublierait où elle en était et vous ramènerait brutalement sur les Catégories.
// Sans le bloc 3, si vous cliquez sur Produits, puis que vous cliquez sur la flèche Retour de votre navigateur, l'URL redeviendrait index.html, mais l'écran resterait bloqué sur les Produits.
// Souhaitez-vous maintenant que l'on vérifie ensemble le code de votre barre latérale (le menu) pour s'assurer que vos boutons appellent correctement la fonction navigate() lors d'un clic ?




// ==========================================================
// return `
//     <div class="space-y-4">
//       <div>
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitLibelle">Libellé *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="produitLibelle" value="${escapeHtml(produit?.libelle || "")}" placeholder="ex: Souris" autocomplete="off" />
//         <p id="error-produitLibelle" class="mt-1 hidden text-xs font-semibold text-rose-600">Le libellé du produit est obligatoire.</p>
//       </div>
//       <div>
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitDescription">Description</label>
//         <textarea class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="produitDescription" placeholder="ex: Souris optique USB">${escapeHtml(produit?.description || "")}</textarea>
//       </div>
//       <div>
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitPrix">Prix unitaire *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitPrix" value="${escapeHtml(produit?.prix_unitaire || "")}" placeholder="ex: 29.99" autocomplete="off" />
//         <p id="error-produitPrix" class="mt-1 hidden text-xs font-semibold text-rose-600">Le prix unitaire est obligatoire et doit être supérieur à 0.</p>
//       </div>
//       <div>
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitQuantite">Quantité *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitQuantite" value="${escapeHtml(produit?.quantite || "")}" placeholder="ex: 100" autocomplete="off" />
//         <p id="error-produitQuantite" class="mt-1 hidden text-xs font-semibold text-rose-600">La quantité est obligatoire et ne peut pas être négative.</p>
//       </div>
//       <div>
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitCategorie">Catégorie *</label>
//         <select class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="produitCategorie" autocomplete="off">
//           <option value="">Sélectionnez une catégorie</option>
//           ${categories.map((cat) => `<option value="${escapeHtml(cat.id)}" ${produit?.categorieId === cat.id ? "selected" : ""}>${escapeHtml(cat.libelle)}</option>`).join("")}
//         </select>
//         <p id="error-produitCategorie" class="mt-1 hidden text-xs font-semibold text-rose-600">Veuillez sélectionner une catégorie.</p>
//       </div>
//     </div>
//   `;
// }
// =====================================================================================
//  return `
//     <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl mx-auto">
      
//       <!-- DEUX PAR DEUX - Ligne 1 : Libellé -->
//       <div class="col-span-1">
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitLibelle">Libellé *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="produitLibelle" value="${escapeHtml(produit?.libelle || "")}" placeholder="ex: Souris" autocomplete="off" />
//         <p id="error-produitLibelle" class="mt-1 hidden text-xs font-semibold text-rose-600">Le libellé est obligatoire.</p>
//       </div>

//       <!-- DEUX PAR DEUX - Ligne 1 : Prix unitaire -->
//       <div class="col-span-1">
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitPrix">Prix unitaire *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitPrix" value="${escapeHtml(produit?.prix_unitaire || "")}" placeholder="ex: 29.99" autocomplete="off" />
//         <p id="error-produitPrix" class="mt-1 hidden text-xs font-semibold text-rose-600">Doit être supérieur à 0.</p>
//       </div>

//       <!-- DEUX PAR DEUX - Ligne 2 : Quantité -->
//       <div class="col-span-1">
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitQuantite">Quantité *</label>
//         <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitQuantite" value="${escapeHtml(produit?.quantite || "")}" placeholder="ex: 100" autocomplete="off" />
//         <p id="error-produitQuantite" class="mt-1 hidden text-xs font-semibold text-rose-600">Ne peut pas être négative.</p>
//       </div>
      
//       <!-- Espace vide pour laisser la quantité seule sur sa moitié de ligne -->
//       <div class="hidden md:block col-span-1"></div>

//       <!-- SEULE SUR SA LIGNE - Ligne 3 : Catégorie -->
//       <div class="col-span-1 md:col-span-2">
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitCategorie">Catégorie *</label>
//         <select class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="produitCategorie" autocomplete="off">
//           <option value="">Sélectionnez une catégorie</option>
//           ${categories.map((cat) => `<option value="${escapeHtml(cat.id)}" ${produit?.categorieId === cat.id ? "selected" : ""}>${escapeHtml(cat.libelle)}</option>`).join("")}
//         </select>
//         <p id="error-produitCategorie" class="mt-1 hidden text-xs font-semibold text-rose-600">La catégorie est obligatoire.</p>
//       </div>

//       <!-- SEULE SUR SA LIGNE - Ligne 4 : Description -->
//       <div class="col-span-1 md:col-span-2">
//         <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitDescription">Description</label>
//         <textarea class="w-full h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-none" id="produitDescription" placeholder="ex: Souris optique USB...">${escapeHtml(produit?.description || "")}</textarea>
//       </div>
      
//     </div>
//   `;


// =====================================================
// import { showToast } from "./components/toast.js";
// import { renderCategoriesPage } from "./pages/categoriesPage.js";
// import { renderProduitsPage } from "./pages/ProduitsPage.js";

// const routes = {
//   categories: renderCategoriesPage,
//   produits: renderProduitsPage,
  
// };

// const titles = {
//   categories: "Catégories",
//   produits: "Produits",

// };

// export async function navigate(page = "categories") {
//   const app = document.getElementById("app");
//   const route = routes[page] || routes.categories;

//   document.querySelectorAll("[data-page]").forEach((button) => {
//     const isActive = button.dataset.page === page;
//     button.classList.toggle("bg-slate-950", isActive);
//     button.classList.toggle("text-white", isActive);
//     button.classList.toggle("shadow-lg", isActive);
//     button.classList.toggle("shadow-slate-200", isActive);
//     button.classList.toggle("text-slate-600", !isActive);
//     button.classList.toggle("hover:bg-slate-100", !isActive);
//     button.classList.toggle("hover:text-slate-950", !isActive);
//   });

//   const navbarTitle = document.getElementById("navbarTitle");
//   if (navbarTitle) {
//     navbarTitle.textContent = titles[page] || titles.categories;
//   }

//   app.innerHTML = `
//     <div class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
//       <div>
//         <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
//         <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
//       </div>
//     </div>
//   `;

//   try {
//     await route();
//   } catch (error) {
//     app.innerHTML = `
//       <section class="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
//         <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
//           <i class="fa-solid fa-triangle-exclamation"></i>
//         </div>
//         <h1 class="text-2xl font-black tracking-tight text-slate-950">Erreur de chargement</h1>
//         <p class="mt-2 text-sm leading-6 text-slate-600">${error.message}</p>
//         <p class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
//           Vérifie que JSON Server est bien lancé avec :
//           <strong class="font-black text-slate-950">npx json-server db.json --port 3000</strong>
//         </p>
//       </section>
//     `;
//     showToast(error.message, "error");
//   }
// }
