const validApiKey = process.env.API_KEY;
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(400).json({ message: "Error" });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};

module.exports = checkApiKey;
