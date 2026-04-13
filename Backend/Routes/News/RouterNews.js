const app = require("express");
const router = app.Router();
const db = require("../../Libs/db");

router.get("/", async (req, res) => {
  db.query(
    `SELECT  title, body
         FROM event`,
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Chyba při načítání turnajů a soustředění" });
      res.json(results);
    },
  );
});

module.exports = router;
