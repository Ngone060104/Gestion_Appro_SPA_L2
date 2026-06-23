export function required(value, message) {
  if (!String(value ?? "").trim()) {
    throw new Error(message);
  }
}


// export function validateForm(data, rules) {
//   const errors = {};

//   for (const field in rules) {
//     const rule = rules[field];
//     const value = String(data[field] ?? "");

//     if (!value.trim()) {
//       errors[field] = rule.message;
//     }
//   }

//   return errors;
// }
export function required(value, message) {
  if (!String(value ?? "").trim()) {
    throw new Error(message);
  }
}

export function validateForm(data, rules) {
  const errors = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];

    // Si une fonction validate personnalisée est fournie, on l'utilise.
    if (typeof rule.validate === "function") {
      const isValid = rule.validate(value, data);
      if (!isValid) {
        errors[field] = rule.message;
      }
      continue;
    }

    // Sinon, comportement par défaut : champ obligatoire (non vide après trim).
    const stringValue = String(value ?? "");
    if (!stringValue.trim()) {
      errors[field] = rule.message;
    }
  }

  return errors;
}