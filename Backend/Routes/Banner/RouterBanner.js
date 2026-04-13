const express = require("express");
const { createUpload, getFilePath } = require("../../utils/upload");
const db = require("../../Libs/db");
const fs = require("fs");

const router = express.Router();

const upload = createUpload("banners");

router.get("/", (req, res) => {
  const { active } = req.query;

  let query = "SELECT * FROM banner";
  let params = [];

  if (active === "true") {
    query += " WHERE active = ?";
    params.push(1);
  }

  query += " ORDER BY id DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Chyba při načítání bannerů:", err);
      return res.status(500).json({ error: "Chyba při načítání dat" });
    }
    res.json(results);
  });
});

router.post("/", upload.single("image"), (req, res) => {
  console.log("Soubor nahrán:", req.file);
  console.log("Cesta:", req.file?.path);
  const { banner_name, active } = req.body;

  if (!banner_name || !req.file) {
    return res.status(400).json({ error: "Chybí název nebo obrázek" });
  }

  const img_path = `/uploads/banners/${req.file.filename}`;
  const isActive = active === "1" || active === true ? 1 : 0;

  db.query(
    "INSERT INTO banner (banner_name, img_path, active) VALUES (?, ?, ?)",
    [banner_name, img_path, isActive],
    (err, result) => {
      if (err) {
        console.error("Chyba při ukládání do DB:", err);
        return res
          .status(500)
          .json({ error: "Chyba při ukládání do databáze" });
      }

      res.status(201).json({
        success: true,
        message: "Banner byl úspěšně přidán",
        id: result.insertId,
        img_path,
        active: isActive,
      });
    },
  );
});

router.patch("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  db.query(
    "UPDATE banner SET active = ? WHERE id = ?",
    [active ? 1 : 0, id],
    (err, result) => {
      if (err) {
        console.error("Chyba při aktualizaci banneru:", err);
        return res.status(500).json({ error: "Chyba při aktualizaci banneru" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Banner nenalezen" });
      }

      res.json({
        success: true,
        message: `Banner byl ${active ? "aktivován" : "deaktivován"}`,
        active,
      });
    },
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT img_path FROM banner WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Chyba při hledání banneru:", err);
      return res.status(500).json({ error: "Chyba při hledání banneru" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Banner nenalezen" });
    }

    const imgPath = results[0].img_path;
    const fullPath = getFilePath(imgPath);

    db.query("DELETE FROM banner WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Chyba při mazání banneru:", err);
        return res.status(500).json({ error: "Chyba při mazání z databáze" });
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Soubor ${fullPath} byl smazán`);
      }

      res.json({ success: true, message: "Banner byl úspěšně smazán" });
    });
  });
});

module.exports = router;
