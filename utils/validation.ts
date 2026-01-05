// utils/validation.ts

export const cleanInput = (text: string): string => {
  return text
    .replace(/\s/g, "")
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+?/g,
      ""
    );
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email.trim() === "") {
    return false;
  }

  if (!regex.test(email)) {
    return false;
  }

  return true;
};

export const validatePassword = (password: string): boolean => {
  if (password.trim() === "") {
    return false;
  }
  
  if (password.length < 6) {
    return false;
  }

  return true;
};

export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  return hasUpperCase && hasSymbol && hasDigit && isLongEnough;
};

export const removeEmojis = (text: string): string => {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+?/g,
    ""
  );
};

export const cleanNameInput = (text: string): string => {
  return removeEmojis(text).replace(/[^A-Za-z0-9. ]/g, "");
};

export const cleanAlphaInput = (text: string): string => {
  return removeEmojis(text).replace(/[^A-Za-z. ]/g, "");
};

export const cleanAlphanumericInput = (text: string): string => {
  return removeEmojis(text).replace(/[^A-Za-z0-9. ]/g, "");
};
