import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
// (Vérifiez le chemin exact selon l'emplacement de votre fichier de routage, par exemple "../router.js" ou "../app.js")
import { validateForm } from "../utils/validators.js";
import {
  createProduit,
  deleteProduit,
  getProduits,
  updateProduit,
} from "../services/produitService.js";
import { getCategories } from "../services/categorieService.js";
import { uploadProductImage } from "../services/cloudinaryService.js";
import { navigate } from "../router.js";

const categories = await getCategories();

let produitViewMode = "table"; // "table" | "cards"
let produitCurrentPage = 1;
const PRODUITS_PER_PAGE = 4;

function produitFormBody(produit) {
  return `
    <div class="grid grid-cols-1 gap-y-4 max-h-[60vh] overflow-y-auto pr-1 md:grid-cols-2 md:gap-x-6 md:gap-y-5 max-w-2xl mx-auto">
      
      <!-- Ligne 1 - Gauche : Libellé -->
      <div class="col-span-1">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitLibelle">Libellé *</label>
        <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="produitLibelle" value="${escapeHtml(produit?.libelle || "")}" placeholder="ex: Souris" autocomplete="off" />
        <p id="error-produitLibelle" class="mt-1 hidden text-xs font-semibold text-rose-600">Le libellé est obligatoire.</p>
      </div>

      <!-- Ligne 1 - Droite : Prix unitaire -->
      <div class="col-span-1">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitPrix">Prix unitaire *</label>
        <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitPrix" value="${escapeHtml(produit?.prix_unitaire || "")}" placeholder="ex: 29.99" autocomplete="off" />
        <p id="error-produitPrix" class="mt-1 hidden text-xs font-semibold text-rose-600">Doit être supérieur à 0.</p>
      </div>

      <!-- Ligne 2 - Gauche : Quantité -->
      <div class="col-span-1">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitQuantite">Quantité *</label>
        <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitQuantite" value="${escapeHtml(produit?.quantite || "")}" placeholder="ex: 100" autocomplete="off" />
        <p id="error-produitQuantite" class="mt-1 hidden text-xs font-semibold text-rose-600">Ne peut pas être négative.</p>
      </div>
      
      <!-- Ligne 2 - Droite : Catégorie (Placée ici pour faire une paire parfaite avec Quantité) -->
      <div class="col-span-1">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitCategorie">Catégorie *</label>
        <select class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="produitCategorie" autocomplete="off">
          <option value="">Sélectionnez une catégorie</option>
          ${categories.map((cat) => `<option value="${escapeHtml(cat.id)}" ${produit?.categorieId === cat.id ? "selected" : ""}>${escapeHtml(cat.libelle)}</option>`).join("")}
        </select>
        <p id="error-produitCategorie" class="mt-1 hidden text-xs font-semibold text-rose-600">La catégorie est obligatoire.</p>
      </div>

      <!-- Ligne 3 : Description prend TOUTE la largeur (2 colonnes) -->
      <div class="col-span-1 md:col-span-2">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitDescription">Description</label>
        <textarea class="w-full h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-none" id="produitDescription" placeholder="ex: Souris optique USB...">${escapeHtml(produit?.description || "")}</textarea>
      </div>
      
      <div class="col-span-1 md:col-span-2">
    <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitImage">Image du produit</label>
    <div class="flex items-center gap-4">
      ${produit?.imageUrl ? `<img src="${produit.imageUrl}" id="previewImage" class="h-14 w-14 rounded-xl object-cover border border-slate-200" />` : `<div id="previewImagePlaceholder" class="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><i class="fa-solid fa-image"></i></div>`}
      <input class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-slate-700 hover:file:bg-slate-200" type="file" id="produitImage" accept="image/*" />
      </div>
      <p id="error-produitImage" class="mt-1 hidden text-xs font-semibold text-rose-600">L'image du produit est obligatoire.</p>
  </div>

    </div>
  `;
}

function openProduitForm(produit = null) {
  openModal({
    title: produit ? "Modifier le produit" : "Nouveau Produit",
    icon: "fa-tag",
    body: produitFormBody(produit),
    confirmLabel: produit ? "Enregistrer" : "Créer",
    onConfirm: async (modal) => {

      // 1. Sélection correcte des éléments du DOM
      const inputLibelle = modal.querySelector("#produitLibelle");
      const inputDescription = modal.querySelector("#produitDescription");
      const inputPrix = modal.querySelector("#produitPrix");
      const inputQuantite = modal.querySelector("#produitQuantite");
      const inputCategorie = modal.querySelector("#produitCategorie");
      const inputFile = modal.querySelector("#produitImage");
      

      // 2. Extraction des valeurs propres
      const libelle = inputLibelle.value.trim();
      const description = inputDescription.value.trim();
      const prix_unitaire = inputPrix.value;
      const quantite = inputQuantite.value;
      const categorieId = inputCategorie.value;
      const uploadimage = inputFile.value;

     // Réinitialiser les messages d'erreur et bordures avant chaque validation
      modal.querySelectorAll("[id^='error-']").forEach((p) => p.classList.add("hidden"));
      modal.querySelectorAll("input, select").forEach((el) =>
        el.classList.remove("border-rose-500", "focus:ring-rose-100")
      );

      // Validation via validateForm (générique avec règles personnalisées)
      const errors = validateForm(
        {
          produitLibelle: libelle,
          produitPrix: prix_unitaire,
          produitQuantite: quantite,
          produitCategorie: categorieId,
          produitImage: inputFile.files.length,
        },
        {
          produitLibelle: {
            message: "Le libellé est obligatoire.",
          },
          produitPrix: {
            message: "Doit être supérieur à 0.",
            validate: (value) => value && parseFloat(value) > 0,
          },
          produitQuantite: {
            message: "Ne peut pas être négative.",
            validate: (value) => value !== "" && parseInt(value) >= 0,
          },
          produitCategorie: {
            message: "La catégorie est obligatoire.",
          },
          produitImage: {
            message: "L'image du produit est obligatoire.",
            validate: (value) => produit || value > 0,
          },
        }
      );

      if (Object.keys(errors).length > 0) {
        for (const field in errors) {
          const errorEl = modal.querySelector(`#error-${field}`);
          const inputEl = modal.querySelector(`#${field}`);
          if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.classList.remove("hidden");
          }
          if (inputEl) {
            inputEl.classList.add("border-rose-500", "focus:ring-rose-100");
          }
        }
        return false;
      }

      try {

        let imageUrl = produit?.imageUrl || ""; 

      
        if (inputFile && inputFile.files.length > 0) {
          const file = inputFile.files[0];
          showToast("Téléversement de l'image en cours...", "info");

          const result = await uploadProductImage(file);
          imageUrl = result.imageUrl; 
        }

           // 2. CRÉATION DE L'OBJET DE DONNÉES CONFORME POUR LE SERVEUR
        const produitData = {
          libelle,
          description,
          prix_unitaire: parseFloat(prix_unitaire), // Convertit le texte "2000" en nombre 2000
          quantite: parseInt(quantite),             // Convertit le texte "10" en nombre 10
          categorieId,
          imageUrl                                 
        };

        if (produit) {
          await updateProduit(produit.id, produitData);
          showToast("Produit modifié avec succès.");
        } else {
          await createProduit(produitData);
          showToast("Produit créé avec succès.");
        }

        await navigate("produits");
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
  });

  
}

function renderProduitsTable(produits) {
  return renderTable({
    rows: produits,
    emptyMessage: "Aucun produit enregistré.",
    columns: [
      {
        label: "Image",
        render: (prod) => {
          const imgUrl = prod.imageUrl || "https://placehold.co";
          return `<img src="${imgUrl}" class="h-10 w-10 rounded-xl object-cover border border-slate-200 bg-slate-50 shadow-sm" alt="${prod.libelle}" />`;
        },
      },
      { label: "Libellé", render: (prod) => `<strong class="font-bold text-slate-950">${escapeHtml(prod.libelle)}</strong>` },
      { label: "Description", render: (prod) => `<p class="text-sm text-slate-500">${escapeHtml(prod.description)}</p>` },
      { label: "Prix unitaire", render: (prod) => `<span class="font-bold text-sm text-slate-600">${parseFloat(prod.prix_unitaire)} fcfa</span>` },
      { label: "Quantité", render: (prod) => `<span class="font-bold text-sm text-green-600">${parseInt(prod.quantite)}</span>` },
      { label: "Catégorie", render: (prod) => `<span class="font-bold text-sm text-blue-600">${escapeHtml(prod.categorieLibelle || prod.categorieId)}</span>` },
      {
        label: "Actions",
        render: (prod) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(prod.id)}">
                    <i class="fa-solid fa-pen"></i>
                    Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(prod.id)}">
                    <i class="fa-solid fa-trash"></i>
                    Supprimer
                  </button>
                </div>
              `,
      },
    ],
  });
}

function renderProduitsCards(produits) {
  if (produits.length === 0) {
    return `<p class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500">Aucun produit enregistré.</p>`;
  }

  return `<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${produits
      .map((prod) => {
        const imgUrl = prod.imageUrl || "https://placehold.co/400x300?text=Produit";
        const categorieLabel = escapeHtml(prod.categorieLibelle || prod.categorieId || "—");
        return `
          <article class="group flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div class="h-32 w-full overflow-hidden bg-slate-50">
              <img src="${imgUrl}" alt="${escapeHtml(prod.libelle)}" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </div>
            <div class="flex flex-1 flex-col gap-3 p-5">
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-base font-black text-slate-950">${escapeHtml(prod.libelle)}</h3>
                <span class="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-blue-600">${categorieLabel}</span>
              </div>

              ${prod.description ? `<p class="line-clamp-2 text-sm text-slate-500">${escapeHtml(prod.description)}</p>` : ""}

              <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="text-lg font-black text-slate-950">${parseFloat(prod.prix_unitaire)} <span class="text-xs font-bold text-slate-400">fcfa</span></span>
                <span class="rounded-full bg-green-50 px-2.5 py-1 text-xs font-extrabold text-green-600">Stock : ${parseInt(prod.quantite)}</span>
              </div>

              <div class="flex gap-2 pt-1">
                <button class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(prod.id)}">
                  <i class="fa-solid fa-pen"></i>
                  Modifier
                </button>
                <button class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(prod.id)}">
                  <i class="fa-solid fa-trash"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("")}
  </div>`;
}

function renderPagination(totalItems, currentPage, perPage) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (totalPages <= 1) return "";

  return `
    <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
      <p class="text-sm text-slate-500">Page ${currentPage} sur ${totalPages}</p>
      <div class="flex gap-2">
        <button id="prevPageBtn" class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" ${currentPage === 1 ? "disabled" : ""}>
          <i class="fa-solid fa-chevron-left"></i>
          Précédent
        </button>
        <button id="nextPageBtn" class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" ${currentPage === totalPages ? "disabled" : ""}>
          Suivant
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;
}

export async function renderProduitsPage() {
  const app = document.getElementById("app");
  const produits = await getProduits();

    // Calcul de la pagination
  const totalPages = Math.max(1, Math.ceil(produits.length / PRODUITS_PER_PAGE));
  if (produitCurrentPage > totalPages) produitCurrentPage = totalPages;
 
  const startIndex = (produitCurrentPage - 1) * PRODUITS_PER_PAGE;
  const produitsPage = produits.slice(startIndex, startIndex + PRODUITS_PER_PAGE);

  app.innerHTML = `
    <section>
      ${pageHeader({
    kicker: "Gestion des produits",
    title: "Produits",
    subtitle: "Créer, modifier et supprimer les produits de l'application.",
    actionLabel: "Nouveau produit",
    actionId: "addProduitBtn",
    actionIcon: "fa-plus",
  })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des produits</h2>
            <p class="text-sm text-slate-500">${produits.length} produit(s) enregistré(s).</p>
          </div>

          <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button id="viewTableBtn" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${produitViewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}">
              <i class="fa-solid fa-table-list"></i>
              Tableau
            </button>
            <button id="viewCardsBtn" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${produitViewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}">
              <i class="fa-solid fa-grip"></i>
              Cartes
            </button>
          </div>
        </div>

        ${produitViewMode === "table" ? renderProduitsTable(produits) : renderProduitsCards(produits)}
      </article>
    </section>
  `;

  bindProduitEvents(produits);
}

function bindProduitEvents(produits) {
  document.getElementById("prevPageBtn")?.addEventListener("click", () => {
    produitCurrentPage--;
    renderProduitsPage();
  });
 
  document.getElementById("nextPageBtn")?.addEventListener("click", () => {
    produitCurrentPage++;
    renderProduitsPage();
  });
 
  document.getElementById("viewTableBtn").addEventListener("click", () => {
    produitViewMode = "table";
    produitCurrentPage = 1;
    renderProduitsPage();
  });
 
  document.getElementById("viewCardsBtn").addEventListener("click", () => {
    produitViewMode = "cards";
    produitCurrentPage = 1;
    renderProduitsPage();
  });
 
  document.getElementById("addProduitBtn").addEventListener("click", () => openProduitForm());
 
  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const produit = produits.find((item) => item.id === button.dataset.edit);
      if (produit) openProduitForm(produit);
    });
  });
 
  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;
 
      openConfirm({
        message: "Voulez-vous supprimer ce produit ?",
        onConfirm: async () => {
          try {
            await deleteProduit(id);
            showToast("Produit supprimé.");
            await renderProduitsPage();
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}