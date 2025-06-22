function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

export const checkAuth = () => {
    try { 
      const storedToken = getCookie("token");
      return !storedToken;
    } catch (error) {
      return true;
    }
  };
  