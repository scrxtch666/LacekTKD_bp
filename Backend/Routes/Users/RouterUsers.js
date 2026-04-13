const express = require("express");
const router = express.Router();
const db = require("../../Libs/db");
const bcrypt = require("bcryptjs");
const { verifyToken, isAdmin } = require("../../auth/auth");

router.get("/", async (req, res) => {
  db.query(
    `SELECT 
        users.*,
        fighters.name     AS name,
        fighters.surname  AS surname,
        fighters.img_path AS img_path,
        role.role_name    AS role_name
     FROM users
     LEFT JOIN role     ON users.role_id   = role.id
     LEFT JOIN fighters ON fighters.id     = users.fighter_id
     WHERE status = 'approved'
     `,
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání uživatelů" });
      res.json(results);
    },
  );
});

router.get("/trainer", (req, res) => {
  db.query(
    `SELECT users.id, users.email, users.phone,
            fighters.name, fighters.surname, fighters.id AS fighter_id,
            belts.cup, role.role_name, fighters.img_path
     FROM users
     JOIN fighters ON fighters.id = users.fighter_id
     JOIN role     ON role.id     = users.role_id
     JOIN belts    ON belts.id    = fighters.belts_id
     WHERE role.role_name LIKE '%tr%'`,
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Chyba při načítání trenérských údajů" });
      res.json(results);
    },
  );
});

router.post("/", async (req, res) => {
  const { login, password, email, role_id, fighter_id, status } = req.body;

  if (!login || !password || !role_id) {
    return res
      .status(400)
      .json({ error: "Chybí povinná pole (login, password, role_id)" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      `INSERT INTO users (login, password, email, role_id, fighter_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        login,
        hashedPassword,
        email || null,
        role_id,
        fighter_id || null,
        "approved",
      ],
      (err, result) => {
        if (err) {
          console.error("Chyba při ukládání uživatele:", err);
          return res
            .status(500)
            .json({ error: "Chyba při ukládání do databáze" });
        }
        res.status(201).json({
          success: true,
          message: "Uživatel byl úspěšně přidán",
          id: result.insertId,
        });
      },
    );
  } catch (error) {
    console.error("Chyba:", error);
    res.status(500).json({ error: "Interní chyba serveru" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { login, password, email, role_id, fighter_id } = req.body;

  if (!login || !role_id) {
    return res
      .status(400)
      .json({ error: "Chybí povinná pole (login, role_id)" });
  }

  try {
    let query, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET login=?, password=?, email=?, role_id=?, fighter_id=? WHERE id=?`;
      params = [
        login,
        hashedPassword,
        email || null,
        role_id,
        fighter_id || null,
        id,
      ];
    } else {
      query = `UPDATE users SET login=?, email=?, role_id=?, fighter_id=? WHERE id=?`;
      params = [login, email || null, role_id, fighter_id || null, id];
    }

    db.query(query, params, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ error: "Tento závodník nebo login je již obsazen." });
        }
        console.error(err);
        return res
          .status(500)
          .json({ error: "Chyba při ukládání do databáze" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Uživatel nenalezen" });
      }

      res.json({ success: true, message: "Uživatel byl úspěšně upraven" });
    });
  } catch (error) {
    console.error("Chyba:", error);
    res.status(500).json({ error: "Interní chyba serveru" });
  }
});

router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.query("UPDATE users SET fighter_id = NULL WHERE id = ?", [id], (err) => {
    if (err)
      return res.status(500).json({ error: "Chyba při odpojení závodníka" });

    db.query("DELETE FROM users WHERE id = ?", [id], (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: err2.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Uživatel nenalezen" });
      res.json({ success: true });
    });
  });
});

module.exports = router;
