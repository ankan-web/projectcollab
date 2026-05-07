const ADMIN_EMAIL = "***REMOVED***";
const ADMIN_PASSWORD = "***REMOVED***";

export const checkIsAdmin = async (email) => {
  return email === ADMIN_EMAIL;
};

export const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const verifyAdminCredentials = async (email, password) => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};