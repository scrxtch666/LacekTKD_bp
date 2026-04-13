const express = require("express");
const router = express.Router();
const db = require("../../Libs/db");
const { verifyToken } = require("../../auth/auth");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || "tajnyklic";
const { parseDateSafe } = require("../../utils/date");

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

const createGoogleEvent = async (exam) => {
  try {
    const calendar = getGoogleCalendarClient();
    const event = {
      summary: `Zkoušky: ${exam.title}`,
      location: exam.location || "",
      description: exam.description || "",
      start: { date: exam.date, timeZone: "Europe/Prague" },
      end: { date: exam.date, timeZone: "Europe/Prague" },
    };
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });
    console.log("✅ Google Event vytvořen:", response.data.id);
    return response.data.id;
  } catch (err) {
    console.error("❌ Google Calendar Error (Create):", err.message);
    return null;
  }
};

const updateGoogleEvent = async (googleEventId, exam) => {
  if (!googleEventId) return;
  try {
    const calendar = getGoogleCalendarClient();
    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
      resource: {
        summary: `Zkoušky: ${exam.title}`,
        location: exam.location || "",
        description: exam.description || "",
        start: { date: exam.date, timeZone: "Europe/Prague" },
        end: { date: exam.date, timeZone: "Europe/Prague" },
      },
    });
    console.log("✅ Google Event aktualizován");
  } catch (err) {
    console.error("❌ Google Calendar Error (Update):", err.message);
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
    console.log("✅ Google Event smazán");
  } catch (err) {
    console.error("❌ Google Calendar Error (Delete):", err.message);
  }
};

const getIsRegisteredSQL = (userId) => {
  return userId
    ? `(SELECT COUNT(*) FROM exam_registration er 
        WHERE er.exam_id = e.id 
        AND er.fighter_id = (SELECT fighter_id FROM users WHERE id = ${db.escape(userId)})
      ) AS is_registered`
    : `0 AS is_registered`;
};

router.get("/", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  let userId = null;
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      userId = payload.id;
    } catch (err) {}
  }

  const isRegisteredSQL = getIsRegisteredSQL(userId);

  db.query(
    `SELECT e.*, u.login AS created_by_name, ${isRegisteredSQL}
     FROM exam e
     LEFT JOIN users u ON u.id = e.created_by
     WHERE e.status = 'active'
     ORDER BY e.date ASC`,
    (err, exams) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      if (!exams.length) return res.json([]);

      db.query(
        `SELECT er.exam_id, er.id AS reg_id, f.id AS fighter_id,
                f.name AS fighter_name, f.surname AS fighter_surname,
                f.img_path AS fighter_pfp,
                f.actual_weight_category, b.cup
         FROM exam_registration er
         LEFT JOIN fighters f ON f.id = er.fighter_id
         LEFT JOIN belts b ON b.id = f.belts_id
         ORDER BY f.surname ASC`,
        (err2, regs) => {
          if (err2) return res.status(500).json({ error: "Chyba serveru" });

          const result = exams.map((exam) => ({
            ...exam,
            is_registered: !!exam.is_registered,
            registrations: regs.filter((r) => r.exam_id === exam.id),
          }));
          res.json(result);
        },
      );
    },
  );
});

router.get("/admin", verifyToken, (req, res) => {
  const isRegisteredSQL = getIsRegisteredSQL(req.user.id);

  db.query(
    `SELECT e.*, DATE_FORMAT(e.date, '%Y-%m-%d') AS date, 
     DATE_FORMAT(e.registrable_date, '%Y-%m-%d') AS registrable_date,
     u.login AS created_by_name, ${isRegisteredSQL}
     FROM exam e
     LEFT JOIN users u ON u.id = e.created_by
     ORDER BY e.date DESC`,
    (err, exams) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });

      db.query(
        `SELECT er.exam_id, er.id AS reg_id, f.id AS fighter_id,
                f.name AS fighter_name, f.surname AS fighter_surname,
                f.img_path AS fighter_pfp, b.cup
         FROM exam_registration er
         LEFT JOIN fighters f ON f.id = er.fighter_id
         LEFT JOIN belts b ON b.id = f.belts_id`,
        (err2, regs) => {
          if (err2) return res.status(500).json({ error: "Chyba serveru" });
          res.json(
            exams.map((e) => ({
              ...e,
              is_registered: !!e.is_registered,
              registrations: regs.filter((r) => r.exam_id === e.id),
            })),
          );
        },
      );
    },
  );
});

router.post("/", verifyToken, async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    registrable_date,
    price,
    status,
  } = req.body;
  if (!title || !date)
    return res.status(400).json({ error: "Chybí název nebo datum" });

  const formattedDate = parseDateSafe(date);

  const googleEventId = await createGoogleEvent({
    title,
    location,
    description,
    date: formattedDate,
  });

  db.query(
    `INSERT INTO exam (title, description, date, location, registrable_date, price, status, created_by, google_event_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      formattedDate,
      location || null,
      parseDateSafe(registrable_date),
      price || null,
      status || "hidden",
      req.user.id,
      googleEventId,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Chyba při ukládání" });
      res.status(201).json({ success: true, id: result.insertId });
    },
  );
});

router.put("/:id", verifyToken, async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    registrable_date,
    price,
    status,
  } = req.body;
  const { id } = req.params;
  const formattedDate = parseDateSafe(date);

  db.query(
    "SELECT google_event_id FROM exam WHERE id = ?",
    [id],
    async (err, results) => {
      if (err || !results.length)
        return res.status(404).json({ error: "Nenalezeno" });

      let googleEventId = results[0].google_event_id;

      if (googleEventId) {
        await updateGoogleEvent(googleEventId, {
          title,
          location,
          description,
          date: formattedDate,
        });
      } else {
        googleEventId = await createGoogleEvent({
          title,
          location,
          description,
          date: formattedDate,
        });
      }

      db.query(
        `UPDATE exam SET title=?, description=?, date=?, location=?, registrable_date=?, price=?, status=?, google_event_id=? WHERE id=?`,
        [
          title,
          description || null,
          formattedDate,
          location || null,
          parseDateSafe(registrable_date),
          price || null,
          status || "hidden",
          googleEventId,
          id,
        ],
        (err) => {
          if (err) return res.status(500).json({ error: "Chyba při ukládání" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT google_event_id FROM exam WHERE id = ?",
    [id],
    async (err, results) => {
      if (err || !results.length)
        return res.status(404).json({ error: "Nenalezeno" });

      if (results[0].google_event_id) {
        await deleteGoogleEvent(results[0].google_event_id);
      }

      db.query("DELETE FROM exam_registration WHERE exam_id = ?", [id], () => {
        db.query("DELETE FROM exam WHERE id = ?", [id], (err2) => {
          if (err2) return res.status(500).json({ error: "Chyba při mazání" });
          res.json({ success: true });
        });
      });
    },
  );
});

router.post("/:id/register/fighter/:fighterId", verifyToken, (req, res) => {
  const { id, fighterId } = req.params;

  db.query(
    "INSERT INTO exam_registration (exam_id, fighter_id) VALUES (?, ?)",
    [id, fighterId],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: "Závodník je už na tuto zkoušku přihlášen",
          });
        }
        return res.status(500).json({ error: "Chyba při přihlašování" });
      }

      res.json({ success: true });
    },
  );
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
        "INSERT INTO exam_registration (exam_id, fighter_id) VALUES (?, ?)",
        [req.params.id, fighter_id],
        (err2) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při přihlašování" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.delete("/:id/register", verifyToken, (req, res) => {
  const examId = req.params.id;

  db.query(
    "SELECT registrable_date FROM exam WHERE id = ?",
    [examId],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(500).json({ error: "Chyba serveru" });

      if (results[0].registrable_date) {
        const deadline = new Date(results[0].registrable_date);
        deadline.setHours(23, 59, 59, 999);
        if (new Date() > deadline) {
          return res
            .status(403)
            .json({ error: "Po uzávěrce se již nelze odhlásit!" });
        }
      }

      db.query(
        `DELETE er FROM exam_registration er
       JOIN users u ON u.fighter_id = er.fighter_id
       WHERE er.exam_id = ? AND u.id = ?`,
        [examId, req.user.id],
        (err2) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při odhlašování" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.delete("/registration/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM exam_registration WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Chyba při mazání" });
      res.json({ success: true });
    },
  );
});

router.put("/:id/status", verifyToken, (req, res) => {
  const { status } = req.body;
  if (!["active", "hidden"].includes(status))
    return res.status(400).json({ error: "Neplatný status" });

  db.query(
    "UPDATE exam SET status=? WHERE id=?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      res.json({ success: true });
    },
  );
});

router.get("/calendar", (req, res) => {
  const { month } = req.query;
  let where = "WHERE e.status = 'active'";
  let params = [];

  if (month) {
    where += " AND DATE_FORMAT(e.date, '%Y-%m') = ?";
    params.push(month);
  }

  db.query(
    `SELECT e.id, e.title AS name, e.location, e.price, 
            DATE_FORMAT(e.date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(e.date, '%Y-%m-%d') AS end_date,
            'exam' AS event_type
     FROM exam e ${where}`,
    params,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      res.json(results);
    },
  );
});

module.exports = router;
