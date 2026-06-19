import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeProduit(data) {
  return {
    id: data.id,
    libelle: String(data.libelle).trim(),
    description: String(data.description).trim() || "",
    prix_unitaire: Number(data.prix_unitaire) || 0,
    quantite: Number(data.quantite) || 0,
    categorieId: String(data.categorieId).trim() || "",
    imageUrl : data.imageUrl ? String(data.imageUrl).trim() : ""
  };
}

export async function getProduits() {
  return apiRequest(ENDPOINTS.produits, {}, "Impossible de charger les produits.");
}

export async function createProduit(data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.description, "La description du produit est obligatoire.");
  required(data.prix_unitaire, "Le prix unitaire du produit est obligatoire.");
  required(data.quantite, "La quantité du produit est obligatoire.");
  required(data.categorieId, "La catégorie du produit est obligatoire.");

  const produit = normalizeProduit({
    id: createId("prod"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.produits,
    {
      method: "POST",
      body: JSON.stringify(produit),
    },
    "Impossible de créer le produit."
  );
}

export async function updateProduit(id, data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.description, "La description du produit est obligatoire.");
  required(data.prix_unitaire, "Le prix unitaire du produit est obligatoire.");
  required(data.quantite, "La quantité du produit est obligatoire.");
  required(data.categorieId, "La catégorie du produit est obligatoire.");
  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeProduit({ id, ...data })),
    },
    "Impossible de modifier le produit."
  );
}

export async function deleteProduit(id) {
  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le produit."
  );
}


