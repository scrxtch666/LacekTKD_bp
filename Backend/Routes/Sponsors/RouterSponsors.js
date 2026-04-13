const express = require("express");
const { createUpload, getFilePath } = require("../../utils/upload");
const db = require("../../Libs/db");
const fs = require("fs");

const router = express.Router();
const upload = createUpload("sponsors");

router.get("/", (req, res) => {
  db.query("SELECT * FROM sponsors ORDER BY id DESC", (err, results) => {
    if (err)
      return res.status(500).json({ error: "Chyba při načítání sponzorů" });
    res.json(results);
  });
});

router.post("/", upload.single("image"), (req, res) => {
  const { sponsor_name, url } = req.body;
  if (!sponsor_name || !req.file)
    return res.status(400).json({ error: "Chybí název nebo obrázek" });

  const img_path = `/uploads/sponsors/${req.file.filename}`;

  db.query(
    "INSERT INTO sponsors (sponsor_name, url, img_path) VALUES (?, ?, ?)",
    [sponsor_name, url || null, img_path],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Chyba při ukládání do databáze" });
      res.status(201).json({ success: true, id: result.insertId, img_path });
    },
  );
});

router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { sponsor_name, url } = req.body;
  if (!sponsor_name)
    return res.status(400).json({ error: "Chybí název sponzora" });

  if (req.file) {
    db.query(
      "SELECT img_path FROM sponsors WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Chyba serveru" });
        if (!results.length)
          return res.status(404).json({ error: "Sponzor nenalezen" });

        const oldPath = getFilePath(results[0].img_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        const img_path = `/uploads/sponsors/${req.file.filename}`;
        db.query(
          "UPDATE sponsors SET sponsor_name=?, url=?, img_path=? WHERE id=?",
          [sponsor_name, url || null, img_path, id],
          (err2) => {
            if (err2)
              return res.status(500).json({ error: "Chyba při aktualizaci" });
            res.json({ success: true, img_path });
          },
        );
      },
    );
  } else {
    db.query(
      "UPDATE sponsors SET sponsor_name=?, url=? WHERE id=?",
      [sponsor_name, url || null, id],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Chyba při aktualizaci" });
        if (!result.affectedRows)
          return res.status(404).json({ error: "Sponzor nenalezen" });
        res.json({ success: true });
      },
    );
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT img_path FROM sponsors WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      if (!results.length)
        return res.status(404).json({ error: "Sponzor nenalezen" });

      const fullPath = getFilePath(results[0].img_path);

      db.query("DELETE FROM sponsors WHERE id = ?", [id], (err2) => {
        if (err2) return res.status(500).json({ error: "Chyba při mazání" });
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        res.json({ success: true });
      });
    },
  );
});

module.exports = router;
