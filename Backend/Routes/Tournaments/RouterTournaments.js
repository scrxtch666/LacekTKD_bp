require("dotenv").config();
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || "tajnyklic";
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../Libs/db");
const { google } = require("googleapis");
const { verifyToken, isAdminOrTrainer } = require("../../auth/auth");
const jwt = require("jsonwebtoken");
const { createUpload, getFilePath } = require("../../utils/upload");

const router = express.Router();
const upload = createUpload("tournaments");

// Google kalendář
const GOOGLE_SERVICE_ACCOUNT_KEY = path.join(
  __dirname,
  "../../lacektkd-12aaabdf5383.json",
);

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const getGoogleCalendarClient = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
};

const createGoogleEvent = async (tournament) => {
  try {
    console.log("📅 Vytvářím Google event...");
    console.log("📅 Calendar ID:", CALENDAR_ID);
    console.log("📅 JSON klíč:", GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log(
      "📅 Soubor existuje:",
      fs.existsSync(GOOGLE_SERVICE_ACCOUNT_KEY),
    );

    const calendar = getGoogleCalendarClient();
    const event = {
      summary: tournament.name,
      location: tournament.location || "",
      description: tournament.info || "",
      start: { date: tournament.start_date, timeZone: "Europe/Prague" },
      end: {
        date: tournament.end_date || tournament.start_date,
        timeZone: "Europe/Prague",
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log("✅ Event vytvořen! ID:", response.data.id);
    return response.data.id;
  } catch (err) {
    console.error("❌ Chyba:", err.message);
    console.error("❌ Detail:", err.errors || err.code);
    return null;
  }
};

const updateGoogleEvent = async (googleEventId, tournament) => {
  if (!googleEventId) return;
  try {
    const calendar = getGoogleCalendarClient();
    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
      resource: {
        summary: tournament.name,
        location: tournament.location || "",
        description: tournament.info || "",
        start: {
          date: tournament.start_date,
          timeZone: "Europe/Prague",
        },
        end: {
          date: tournament.end_date || tournament.start_date,
          timeZone: "Europe/Prague",
        },
      },
    });
  } catch (err) {
    console.error(
      "Google Calendar – chyba při aktualizaci eventu:",
      err.message,
    );
  }
};

const deleteGoogleEvent = async (googleEventId) => {
  if (!googleEventId) return;
  try {
    const calendar = getGoogleCalendarClient();
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
    });
  } catch (err) {
    console.error("Google Calendar – chyba při mazání eventu:", err.message);
  }
};

router.get("/calendar", (req, res) => {
  const { month } = req.query;
  const token = req.headers["authorization"]?.split(" ")[1];

  let userRole = "guest";
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      userRole = payload.role;
    } catch {}
  }

  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";

  let whereClause = isAdminOrTrainer
    ? "WHERE 1=1"
    : "WHERE tournament.status = 'completed'";
  let params = [];

  if (month) {
    const monthFilter = `(
      DATE_FORMAT(tournament.start_date, '%Y-%m') = ? OR
      DATE_FORMAT(tournament.end_date, '%Y-%m') = ? OR
      (tournament.start_date <= LAST_DAY(?) AND tournament.end_date >= ?)
    )`;
    whereClause = isAdminOrTrainer
      ? `WHERE ${monthFilter}`
      : `WHERE tournament.status = 'completed' AND ${monthFilter}`;
    const firstDay = month + "-01";
    params = [month, month, firstDay, firstDay];
  }

  db.query(
    `SELECT
        tournament.id,
        tournament.name,
        tournament.location,
        tournament.price,
        tournament.info,
        tournament.img_path,
        tournament.status,
        tournament.type_id,
        type.name AS type_name,
        DATE_FORMAT(tournament.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(tournament.end_date, '%Y-%m-%d') AS end_date,
        tournament.google_event_id
     FROM tournament
     LEFT JOIN type ON tournament.type_id = type.id
     ${whereClause}
     ORDER BY tournament.start_date ASC`,
    params,
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání turnajů" });
      res.json(results);
    },
  );
});

router.get("/", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  let userId = null;
  let userRole = "guest";

  if (token) {
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      userId = payload.id;
      userRole = payload.role || "guest";
      console.log("✅ Token OK, userId:", userId, "role:", userRole);
    } catch (err) {
      console.log("❌ Token error:", err.message);
    }
  } else {
    console.log("⚠️ Žádný token");
  }

  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";

  const isRegisteredSQL = userId
    ? `(SELECT COUNT(*) FROM tournament_registration tr 
        WHERE tr.tournament_id = tournament.id 
        AND tr.fighter_id = (SELECT fighter_id FROM users WHERE id = ${db.escape(userId)})) AS is_registered`
    : `0 AS is_registered`;

  const whereClause = isAdminOrTrainer
    ? ""
    : "WHERE tournament.status = 'completed'";

  db.query(
    `SELECT
      tournament.id,
      tournament.name,
      tournament.location,
      tournament.price,
      tournament.info,
      tournament.img_path,
      DATE_FORMAT(tournament.registrable_date, '%d.%m.%Y') AS registrable_date_formatted,
      DATE_FORMAT(tournament.registrable_date, '%Y-%m-%d') AS registrable_date_raw,
      tournament.status,
      tournament.type_id,
      type.name AS type_name,
      DATE_FORMAT(tournament.start_date, '%d.%m.') AS start_date_formatted,
      DATE_FORMAT(tournament.end_date, '%d.%m.%Y') AS end_date_formatted,
      DATE_FORMAT(tournament.start_date, '%Y-%m-%d') AS start_date_raw,
      DATE_FORMAT(tournament.end_date, '%Y-%m-%d') AS end_date_raw,
      ${isRegisteredSQL}
   FROM tournament
   LEFT JOIN type ON tournament.type_id = type.id
   ${whereClause}
   ORDER BY tournament.start_date DESC`,
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání turnajů" });
      res.json(results);
    },
  );
});

router.delete("/:id/register", verifyToken, (req, res) => {
  const tournamentId = req.params.id;

  db.query(
    "SELECT registrable_date FROM tournament WHERE id = ?",
    [tournamentId],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(500).json({ error: "Chyba serveru" });

      const deadline = new Date(results[0].registrable_date);
      deadline.setHours(23, 59, 59, 999);

      if (new Date() > deadline) {
        return res
          .status(403)
          .json({ error: "Po uzávěrce se již nelze odhlásit!" });
      }

      db.query(
        `DELETE tr FROM tournament_registration tr
         JOIN users u ON u.fighter_id = tr.fighter_id
         WHERE tr.tournament_id = ? AND u.id = ?`,
        [tournamentId, req.user.id],
        (err2) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při odhlašování" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.put("/:id/status", verifyToken, isAdminOrTrainer, (req, res) => {
  const { status } = req.body;
  if (!["completed", "uncompleted"].includes(status))
    return res.status(400).json({ error: "Neplatný status" });

  db.query(
    "UPDATE tournament SET status = ? WHERE id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      res.json({ success: true });
    },
  );
});

router.get("/latest", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  let userRole = "guest";

  if (token) {
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      userRole = payload.role || "guest";
      console.log("✅ Token OK, role:", userRole);
    } catch (err) {
      console.log("❌ Token error:", err.message);
    }
  }

  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";

  const whereClause = isAdminOrTrainer
    ? ""
    : "WHERE tournament.status = 'completed'";

  db.query(
    `SELECT
        tournament.id,
        tournament.name,
        tournament.location,
        tournament.price,
        tournament.info,
        tournament.img_path,
        type.name AS type_name,
        DATE_FORMAT(tournament.start_date, '%d.%m.') AS start_date,
        DATE_FORMAT(tournament.end_date, '%d.%m.%Y') AS end_date
     FROM tournament
     LEFT JOIN type ON tournament.type_id = type.id
     ${whereClause}
     ORDER BY tournament.start_date DESC
     LIMIT 1`,
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání dat!" });
      res.json(results);
    },
  );
});

router.get("/types", (req, res) => {
  db.query("SELECT * FROM type ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Chyba při načítání typů" });
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT tournament.*, type.name AS type_name,
    DATE_FORMAT(tournament.registrable_date, '%d.%m.%Y') AS registrable_date_formatted,
        tournament.start_date AS start_date_raw,
        tournament.end_date AS end_date_raw
     FROM tournament
     LEFT JOIN type ON tournament.type_id = type.id
     WHERE tournament.id = ?`,
    [id],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání turnaje" });
      if (!results.length)
        return res.status(404).json({ error: "Turnaj nenalezen" });
      res.json(results[0]);
    },
  );
});

router.post("/", verifyToken, isAdminOrTrainer, upload.single("image"), async (req, res) => {
  const {
    name,
    location,
    price,
    type_id,
    start_date,
    end_date,
    registrable_date,
    info,
    status,
  } = req.body;

  if (!name) return res.status(400).json({ error: "Chybí název turnaje" });

  const img_path = req.file
    ? "/uploads/tournaments/" + req.file.filename
    : null;

  const googleEventId = await createGoogleEvent({
    name,
    location,
    info,
    start_date: start_date || null,
    end_date: end_date || start_date || null,
  });

  const finalStatus =
    status === "completed" || status === "uncompleted" ? status : "completed";

  db.query(
    `INSERT INTO tournament (name, location, price, type_id, start_date, end_date, registrable_date, info, img_path, google_event_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      location || null,
      price || null,
      type_id || null,
      start_date || null,
      end_date || null,
      registrable_date || null,
      info || null,
      img_path,
      googleEventId,
      finalStatus,
    ],
    (err, result) => {
      if (err) {
        console.error("Chyba při ukládání turnaje:", err);
        return res
          .status(500)
          .json({ error: "Chyba při ukládání do databáze" });
      }
      res.status(201).json({
        success: true,
        message: "Turnaj byl úspěšně přidán",
        id: result.insertId,
        google_event_id: googleEventId,
      });
    },
  );
});

router.put("/:id", verifyToken, isAdminOrTrainer, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      price,
      type_id,
      start_date,
      end_date,
      registrable_date,
      info,
      status,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Chybí název turnaje" });

    const finalStatus =
      status === "completed" || status === "uncompleted" ? status : undefined;

    const [results] = await db
      .promise()
      .query("SELECT img_path, google_event_id FROM tournament WHERE id = ?", [
        id,
      ]);

    if (!results.length)
      return res.status(404).json({ error: "Turnaj nenalezen" });

    let { google_event_id, img_path: oldImg } = results[0];

    let googleEventIdToUse = google_event_id;

    if (!googleEventIdToUse) {
      googleEventIdToUse = await createGoogleEvent({
        name,
        location,
        info,
        start_date: start_date || null,
        end_date: end_date || start_date || null,
      });
    } else {
      await updateGoogleEvent(google_event_id, {
        name,
        location,
        info,
        start_date: start_date || null,
        end_date: end_date || start_date || null,
      });
    }

    let newImgPath = undefined;
    if (req.file) {
      if (oldImg) {
        const fullOldPath = getFilePath(oldImg);
        if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
      }
      newImgPath = "/uploads/tournaments/" + req.file.filename;
    }

    let query = `
      UPDATE tournament SET
        name=?, location=?, price=?, type_id=?, start_date=?, end_date=?, registrable_date=?, info=?
    `;
    const params = [
      name,
      location || null,
      price || null,
      type_id || null,
      start_date || null,
      end_date || null,
      registrable_date || null,
      info || null,
    ];

    if (newImgPath) {
      query += ", img_path=?";
      params.push(newImgPath);
    }

    if (finalStatus !== undefined) {
      query += ", status=?";
      params.push(finalStatus);
    }

    if (!google_event_id && googleEventIdToUse) {
      query += ", google_event_id=?";
      params.push(googleEventIdToUse);
    }

    query += " WHERE id=?";
    params.push(id);

    const [updateResult] = await db.promise().query(query, params);

    if (updateResult.affectedRows === 0)
      return res.status(404).json({ error: "Turnaj nenalezen" });

    res.json({ success: true, message: "Turnaj byl úspěšně upraven" });
  } catch (err) {
    console.error("Chyba při úpravě turnaje:", err);
    res.status(500).json({ error: "Chyba serveru při úpravě turnaje" });
  }
});

router.post("/:id/register", verifyToken, (req, res) => {
  db.query(
    `SELECT u.fighter_id, f.name, f.surname, f.birth, f.actual_weight_category
     FROM users u
     LEFT JOIN fighters f ON f.id = u.fighter_id
     WHERE u.id = ?`,
    [req.user.id],
    (err, results) => {
      if (err || !results.length)
        return res.status(400).json({ error: "Uživatel nenalezen" });

      const { fighter_id, name, surname, birth, actual_weight_category } =
        results[0];

      if (!fighter_id)
        return res
          .status(400)
          .json({ error: "Nemáš přiřazeného závodníka. Kontaktuj trenéra." });
      if (!name || !surname)
        return res.status(400).json({
          error: "Závodník nemá vyplněné jméno a příjmení. Kontaktuj trenéra.",
        });
      if (!birth || birth.toString().startsWith("0000"))
        return res.status(400).json({
          error: "Závodník nemá vyplněné datum narození. Kontaktuj trenéra.",
        });
      if (!actual_weight_category)
        return res.status(400).json({
          error:
            "Závodník nemá vyplněnou váhovou kategorii. Kontaktuj trenéra nebo ji doplň v profilu.",
        });

      db.query(
        "INSERT INTO tournament_registration (tournament_id, fighter_id) VALUES (?, ?)",
        [req.params.id, fighter_id],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ error: "Chyba při přihlašování na turnaj" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.delete("/:id", verifyToken, isAdminOrTrainer, async (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT img_path, google_event_id FROM tournament WHERE id = ?",
    [id],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba při hledání" });
      if (!results.length) return res.status(404).json({ error: "Nenalezeno" });

      const { google_event_id, img_path } = results[0];

      await deleteGoogleEvent(google_event_id);

      db.query(
        "DELETE FROM tournament_registration WHERE tournament_id = ?",
        [id],
        (errReg) => {
          if (errReg)
            return res
              .status(500)
              .json({ error: "Chyba při mazání registrací" });

          db.query("DELETE FROM tournament WHERE id = ?", [id], (err2) => {
            if (err2)
              return res
                .status(500)
                .json({ error: "Chyba při mazání turnaje" });

            if (img_path) {
              const fullPath = getFilePath(img_path);
              if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }

            res.json({ success: true, message: "Smazáno kompletně" });
          });
        },
      );
    },
  );
});

module.exports = router;
