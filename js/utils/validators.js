export function required(value, message) {
  if (!String(value ?? "").trim()) {
    throw new Error(message);
  }
}


export function validateForm(data,currentId=null) {
    const errors = {};

    if (!data.produitLibelle.trim())
        errors.produitLibelle = "Le libellé du produit est obligatoire.";

    if (!data.produitPrix.trim())
        errors.produitPrix = "La description du produit est obligatoire.";

    if (!data.produitQuantite.trim())
          errors.produitQuantite = "La quantité du produit est obligatoire.";
      
    if (!data.produitCategorie.trim())
        errors.produitCategorie = "Veuillez choisir une categorie.";


    if (!data.produitPrix.trim())
        errors.produitPrix = "La description du produit est obligatoire.";

    if (!data.produitImage.trim())
        errors.produitImage= "L'image du produit est obligatoire.";

    return errors;
}
