const express = require("express");
const router = express.Router();
const { verifyToken, isAdminOrTrainer } = require("../../auth/auth");
const db = require("../../Libs/db");

router.get("/", verifyToken, (req, res) => {
  console.log("req.user:", req.user);

  const userId = req.user.id;
  const userRole = req.user.role || req.user.role_name || "user";

  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";

  if (isAdminOrTrainer) {
    db.query(
      `SELECT tr.id, tr.tournament_id, tr.fighter_id, tr.place,
              t.name AS tournament_name, t.location AS tournament_location,
              t.start_date AS tournament_start_date, t.end_date AS tournament_end_date,
              t.img_path AS tournament_img, ty.name AS type_name,
              f.name AS fighter_name, f.surname AS fighter_surname,
              f.actual_weight_category AS fighter_weight, f.img_path AS fighter_pfp
       FROM tournament_registration tr
       LEFT JOIN tournament t ON t.id = tr.tournament_id
       LEFT JOIN fighters f ON f.id = tr.fighter_id
       LEFT JOIN type ty ON ty.id = t.type_id
       ORDER BY t.start_date DESC, f.surname ASC`,
      (err, results) => {
        if (err) {
          console.error("SQL chyba admin:", err);
          return res
            .status(500)
            .json({ error: "Chyba serveru: " + err.message });
        }
        res.json(results);
      },
    );
  } else {
    db.query(
      `SELECT DISTINCT tr.tournament_id
       FROM tournament_registration tr
       JOIN users u ON u.fighter_id = tr.fighter_id
       WHERE u.id = ?`,
      [userId],
      (err, myTournaments) => {
        if (err) {
          console.error("SQL chyba user step1:", err);
          return res
            .status(500)
            .json({ error: "Chyba serveru: " + err.message });
        }

        if (!myTournaments.length) return res.json([]);

        const tournamentIds = myTournaments.map((t) => t.tournament_id);
        const placeholders = tournamentIds.map(() => "?").join(",");

        db.query(
          `SELECT tr.id, tr.tournament_id, tr.fighter_id, tr.place,
                  t.name AS tournament_name, t.location AS tournament_location,
                  t.start_date AS tournament_start_date, t.end_date AS tournament_end_date,
                  t.img_path AS tournament_img, ty.name AS type_name,
                  f.name AS fighter_name, f.surname AS fighter_surname,
                  f.actual_weight_category AS fighter_weight, f.img_path AS fighter_pfp
           FROM tournament_registration tr
           LEFT JOIN tournament t ON t.id = tr.tournament_id
           LEFT JOIN fighters f ON f.id = tr.fighter_id
           LEFT JOIN type ty ON ty.id = t.type_id
           WHERE tr.tournament_id IN (${placeholders})
           ORDER BY t.start_date DESC, f.surname ASC`,
          tournamentIds,
          (err2, results) => {
            if (err2) {
              console.error("SQL chyba user step2:", err2);
              return res
                .status(500)
                .json({ error: "Chyba serveru: " + err2.message });
            }
            res.json(results);
          },
        );
      },
    );
  }
});

router.get("/public", (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId)
    return res.status(400).json({ error: "Chybí tournamentId" });

  db.query(
    `SELECT tr.id, tr.tournament_id, tr.fighter_id, tr.place,
            f.name AS fighter_name, f.surname AS fighter_surname,
            f.actual_weight_category AS fighter_weight, f.img_path AS fighter_pfp
     FROM tournament_registration tr
     LEFT JOIN fighters f ON f.id = tr.fighter_id
     WHERE tr.tournament_id = ?
     ORDER BY f.surname ASC`,
    [tournamentId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      res.json(results);
    },
  );
});

router.get("/prihlaseny", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT tr.*, t.name AS tournament_name, t.start_date
     FROM tournament_registration tr
     JOIN tournament t ON t.id = tr.tournament_id
     JOIN users u ON u.fighter_id = tr.fighter_id
     WHERE u.id = ?
     ORDER BY t.start_date DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      res.json(results);
    },
  );
});

router.post("/:tournamentId/fighter/:fighterId", verifyToken, isAdminOrTrainer, (req, res) => {
  const { tournamentId, fighterId } = req.params;

  db.query(
    "INSERT INTO tournament_registration (tournament_id, fighter_id) VALUES (?, ?)",
    [tournamentId, fighterId],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: "Závodník je už na tento turnaj přihlášen",
          });
        }
        return res.status(500).json({ error: "Chyba při přihlašování" });
      }

      res.json({ success: true });
    },
  );
});

router.delete("/:id", verifyToken, isAdminOrTrainer, (req, res) => {
  db.query(
    "DELETE FROM tournament_registration WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Chyba při odhlašování" });
      res.json({ success: true });
    },
  );
});

router.put("/:id/result", verifyToken, isAdminOrTrainer, (req, res) => {
  const { place } = req.body;
  db.query(
    "UPDATE tournament_registration SET place = ? WHERE id = ?",
    [place || null, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ error: "Chyba při ukládání výsledku" });
      res.json({ success: true });
    },
  );
});

module.exports = router;
