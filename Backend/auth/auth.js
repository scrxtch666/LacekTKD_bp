const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || "tajnyklic";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Přístup zamítnut – chybí token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Neplatný nebo expirovaný token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Přístup pouze pro administrátory" });
  next();
};

const isAdminOrTrainer = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role === "admin" || role === "trainer") return next();
  return res.status(403).json({ error: "Nedostatečná oprávnění" });
};

module.exports = { verifyToken, isAdmin, isAdminOrTrainer };
