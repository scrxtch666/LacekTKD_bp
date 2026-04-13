const { verifyToken, isAdmin, isAdminOrTrainer } = require("../../auth/auth");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../Libs/db");
const { parseDateSafe } = require("../../utils/date");
const { createUpload, getFilePath } = require("../../utils/upload");

const router = express.Router();
const upload = createUpload("fighters");

router.get("/", async (req, res) => {
  db.query(
    `SELECT 
        fighters.id, fighters.img_path, fighters.name, fighters.surname,
        fighters.birth, fighters.best, fighters.legend, fighters.active,
        fighters.actual_weight_category, fighters.belts_id, fighters.category_id,
        TIMESTAMPDIFF(YEAR, fighters.birth, CURDATE()) AS age,
        belts.cup, belts.img_path AS belt_path,
        users.id AS user_id, users.login AS user_login,
        users.email AS user_email, users.phone AS user_phone
     FROM fighters
     JOIN belts ON fighters.belts_id = belts.id
     LEFT JOIN users ON users.fighter_id = fighters.id
     WHERE fighters.active = 1
     `,
    (err, fighters) => {
      if (err) return res.status(500).json({ error: "Chyba" });

      db.query(
        `SELECT 
            tr.tournament_id,
            tr.fighter_id,
            tr.place,
            t.name AS tournament,
            DATE_FORMAT(t.start_date, '%d.%m.%Y') AS date
         FROM tournament_registration tr
         JOIN tournament t ON t.id = tr.tournament_id
         WHERE tr.place IS NOT NULL
         ORDER BY t.start_date DESC`,
        (err2, results) => {
          if (err2) return res.status(500).json({ error: "Chyba" });

          const parsed = fighters.map((fighter) => ({
            ...fighter,
            tournament_results: results
              .filter((r) => r.fighter_id === fighter.id)
              .slice(0, 3),
          }));

          res.json(parsed);
        },
      );
    },
  );
});

router.get("/admin", (req, res) => {
  db.query(
    `SELECT 
        fighters.id, fighters.img_path, fighters.name, fighters.surname, 
         DATE_FORMAT(fighters.birth, '%Y-%m-%d') AS birth,
        fighters.best, fighters.legend, fighters.active,
        fighters.actual_weight_category, fighters.belts_id, fighters.category_id,
        TIMESTAMPDIFF(YEAR, fighters.birth, CURDATE()) AS age,
        belts.cup, belts.img_path AS belt_path,
        users.id AS user_id, users.login AS user_login,
        users.email AS user_email, users.phone AS user_phone
     FROM fighters
     JOIN belts ON fighters.belts_id = belts.id
     LEFT JOIN users ON users.fighter_id = fighters.id`,
    (err, fighters) => {
      if (err) return res.status(500).json({ error: "Chyba" });

      db.query(
        `SELECT 
            tr.tournament_id,
            tr.fighter_id,
            tr.place,
            t.name AS tournament,
            DATE_FORMAT(t.start_date, '%d.%m.%Y') AS date
         FROM tournament_registration tr
         JOIN tournament t ON t.id = tr.tournament_id
         WHERE tr.place IS NOT NULL
         ORDER BY t.start_date DESC`,
        (err2, results) => {
          if (err2) return res.status(500).json({ error: "Chyba" });

          const parsed = fighters.map((fighter) => ({
            ...fighter,
            tournament_results: results
              .filter((r) => r.fighter_id === fighter.id)
              .slice(0, 3),
          }));

          res.json(parsed);
        },
      );
    },
  );
});

router.get("/countAll", (req, res) => {
  db.query("SELECT COUNT(id) AS count FROM fighters", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: result[0].count });
  });
});

router.post("/", upload.single("image"), (req, res) => {
  const {
    name,
    surname,
    birth,
    belts_id,
    category_id,
    actual_weight_category,
    best,
    legend,
    active,
    user_id,
  } = req.body;

  if (birth && birth !== "") {
    const [year, month, day] = birth.split("-");
    const parsed = new Date(year, month - 1, day);

    if (!isNaN(parsed.getTime())) {
      parsedBirth = parsed;

      const now = new Date();
      const minAge = 3;

      const age = now.getFullYear() - parsed.getFullYear();
      const monthDiff = now.getMonth() - parsed.getMonth();
      const dayDiff = now.getDate() - parsed.getDate();

      const isTooYoung =
        age < minAge ||
        (age === minAge && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

      if (parsed > now) {
        return res
          .status(400)
          .json({ error: "Datum narození nemůže být v budoucnu." });
      }

      if (isTooYoung) {
        return res.status(400).json({
          error: `Uživatel musí být alespoň ${minAge} let starý.`,
        });
      }
    }
  }

  const img_path = req.file ? "/uploads/fighters/" + req.file.filename : null;

  db.query(
    "INSERT INTO fighters (name, surname, birth, belts_id, img_path, best, legend, active, category_id, actual_weight_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      surname,
      parseDateSafe(birth),
      belts_id,
      img_path,
      best === "1" ? 1 : 0,
      legend === "1" ? 1 : 0,
      active === "1" ? 1 : 0,
      category_id || null,
      actual_weight_category || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Chyba pri ukladani fightera:", err);
        return res
          .status(500)
          .json({ error: "Chyba pri ukladani do databaze" });
      }

      const newFighterId = result.insertId;

      if (user_id && user_id !== "null" && user_id !== "") {
        db.query(
          "UPDATE users SET fighter_id = ? WHERE id = ?",
          [newFighterId, user_id],
          (err2) => {
            if (err2) console.error("Chyba pri prirazeni usera:", err2);
          },
        );
      }

      res.status(201).json({
        success: true,
        message: "Zavodnik byl uspesne pridan",
        id: newFighterId,
        img_path,
      });
    },
  );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT 
        f.id, f.img_path, f.name, f.surname,
        DATE_FORMAT(f.birth, '%Y-%m-%d') AS birth, f.best, f.legend, f.active,
        f.actual_weight_category, f.belts_id, f.category_id,
        TIMESTAMPDIFF(YEAR, f.birth, CURDATE()) AS age,
        b.cup, b.img_path AS belt_path,
        u.id AS user_id, u.login AS user_login,
        u.email AS user_email, u.phone AS user_phone,
        c.name AS category_name,
        c.min,
        c.max
     FROM fighters f
     JOIN belts b ON f.belts_id = b.id
     LEFT JOIN users u ON u.fighter_id = f.id
     LEFT JOIN category c ON c.id = f.category_id
     WHERE f.id = ?`,
    [id],
    (err, fighterResults) => {
      if (err) return res.status(500).json({ error: "Chyba" });
      if (!fighterResults.length)
        return res.status(404).json({ error: "Závodník nenalezen" });

      const fighter = fighterResults[0];

      db.query(
        `SELECT 
            tr.tournament_id,
            tr.place,
            t.name AS tournament,
            DATE_FORMAT(t.start_date, '%d.%m.%Y') AS date
         FROM tournament_registration tr
         JOIN tournament t ON t.id = tr.tournament_id
         WHERE tr.place IS NOT NULL
           AND tr.fighter_id = ?
         ORDER BY t.start_date DESC`,
        [id],
        (err2, results) => {
          if (err2) return res.status(500).json({ error: "Chyba" });

          fighter.tournament_results = results;

          res.json(fighter);
        },
      );
    },
  );
});

router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const {
    name,
    surname,
    birth,
    belts_id,
    category_id,
    actual_weight_category,
    best,
    legend,
    active,
    user_id,
  } = req.body;

  if (!name || !surname) {
    return res.status(400).json({ error: "Chybí jméno nebo příjmení" });
  }

  try {
    let birthDate = null;

    if (birth && birth !== "") {
      const [year, month, day] = birth.split("-");
      const parsed = new Date(year, month - 1, day);

      if (!isNaN(parsed.getTime())) {
        birthDate = parsed;

        const now = new Date();
        const minAge = 3;

        const age = now.getFullYear() - parsed.getFullYear();
        const monthDiff = now.getMonth() - parsed.getMonth();
        const dayDiff = now.getDate() - parsed.getDate();

        const isTooYoung =
          age < minAge ||
          (age === minAge &&
            (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

        if (parsed > now) {
          return res
            .status(400)
            .json({ error: "Datum narození nemůže být v budoucnu." });
        }

        if (isTooYoung) {
          return res.status(400).json({
            error: `Uživatel musí být alespoň ${minAge} let starý.`,
          });
        }
      }
    }

    const doUpdate = (new_img_path) => {
      const hasNewImg = new_img_path !== undefined;

      const query = hasNewImg
        ? "UPDATE fighters SET name=?, surname=?, birth=?, belts_id=?, img_path=?, best=?, legend=?, active=?, category_id=?, actual_weight_category=? WHERE id=?"
        : "UPDATE fighters SET name=?, surname=?, birth=?, belts_id=?, best=?, legend=?, active=?, category_id=?, actual_weight_category=? WHERE id=?";

      const params = hasNewImg
        ? [
            name,
            surname,
            birth || null,
            belts_id || null,
            new_img_path,
            best === "1" ? 1 : 0,
            legend === "1" ? 1 : 0,
            active === "1" ? 1 : 0,
            category_id || null,
            actual_weight_category || null,
            id,
          ]
        : [
            name,
            surname,
            birth || null,
            belts_id || null,
            best === "1" ? 1 : 0,
            legend === "1" ? 1 : 0,
            active === "1" ? 1 : 0,
            category_id || null,
            actual_weight_category || null,
            id,
          ];

      db.query(query, params, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Chyba pri aktualizaci zavodnika" });

        if (result.affectedRows === 0)
          return res.status(404).json({ error: "Zavodnik nenalezen" });

        if (user_id !== undefined) {
          db.query(
            "UPDATE users SET fighter_id = NULL WHERE fighter_id = ?",
            [id],
            (err2) => {
              if (err2) console.error("Chyba pri odpojovani usera:", err2);

              if (user_id && user_id !== "null" && user_id !== "") {
                db.query(
                  "UPDATE users SET fighter_id = ? WHERE id = ?",
                  [id, user_id],
                  (err3) => {
                    if (err3) console.error("Chyba pri prirazeni usera:", err3);
                  },
                );
              }
            },
          );
        }

        res.json({ success: true, message: "Zavodnik byl upraven" });
      });
    };

    if (req.file) {
      db.query(
        "SELECT img_path FROM fighters WHERE id = ?",
        [id],
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Chyba pri hledani zavodnika" });

          if (results.length === 0)
            return res.status(404).json({ error: "Zavodnik nenalezen" });

          const oldImg = results[0].img_path;

          if (oldImg) {
            const fullOldPath = getFilePath(oldImg);
            if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
          }

          doUpdate("/uploads/fighters/" + req.file.filename);
        },
      );
    } else {
      doUpdate(undefined);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Interní chyba serveru" });
  }
});
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM exam_registration WHERE fighter_id = ?",
    [id],
    (err0) => {
      if (err0)
        return res.status(500).json({ error: "Chyba při mazání zkoušek" });

      db.query(
        "DELETE FROM tournament_registration WHERE fighter_id = ?",
        [id],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Chyba při mazání registrací" });

          db.query(
            "UPDATE users SET fighter_id = NULL WHERE fighter_id = ?",
            [id],
            (err2) => {
              db.query(
                "SELECT img_path FROM fighters WHERE id = ?",
                [id],
                (err3, results) => {
                  if (results.length > 0) {
                    const imgPath = results[0].img_path;

                    db.query(
                      "DELETE FROM fighters WHERE id = ?",
                      [id],
                      (err4) => {
                        if (err4)
                          return res.status(500).json({
                            error: "Chyba při mazání závodníka",
                          });

                        if (imgPath) {
                          const fullPath = getFilePath(imgPath);
                          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                        }

                        res.json({
                          success: true,
                          message: "Smazáno vše včetně vazeb",
                        });
                      },
                    );
                  }
                },
              );
            },
          );
        },
      );
    },
  );
});

module.exports = router;
