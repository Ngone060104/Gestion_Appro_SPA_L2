export function required(value, message) {
  if (!String(value ?? "").trim()) {
    throw new Error(message);
  }
}


export function validateForm(data, rules) {
  const errors = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = String(data[field] ?? "");

    if (!value.trim()) {
      errors[field] = rule.message;
    }
  }

  return errors;
}
