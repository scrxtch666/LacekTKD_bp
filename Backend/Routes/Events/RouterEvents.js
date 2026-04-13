const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../Libs/db");
const { verifyToken, isAdmin, isAdminOrTrainer } = require("../../auth/auth");
const { createUpload, getFilePath } = require("../../utils/upload");

const router = express.Router();
const upload = createUpload("events");

const uploadFields = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "photos", maxCount: 10 },
]);

router.get("/", (req, res) => {
  db.query(
    `SELECT 
        e.id,
        e.title,
        e.body,
        e.status,
        e.photo AS cover_photo,
        e.user_id,
        u.login AS author,
        DATE_FORMAT(e.date_start, '%d.%m.%Y') AS date_start,
        e.date_start AS date_start_raw,
        e.created_at
     FROM event e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.status = 'Availible'
     ORDER BY e.id DESC`,
    (err, events) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání aktualit" });
      if (!events.length) return res.json([]);

      db.query(
        "SELECT * FROM event_photos ORDER BY event_id, sort_order ASC",
        (err2, photos) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při načítání fotek" });

          const result = events.map((event) => ({
            ...event,
            photos: photos.filter((p) => p.event_id === event.id),
          }));

          res.json(result);
        },
      );
    },
  );
});

router.get("/admin", verifyToken, isAdminOrTrainer, (req, res) => {
  db.query(
    `SELECT 
        e.id,
        e.title,
        e.body,
        e.status,
        e.photo AS cover_photo,
        e.user_id,
        u.login AS author,
        DATE_FORMAT(e.date_start, '%d.%m.%Y') AS date_start,
        DATE_FORMAT(e.date_start, '%Y-%m-%d') AS date_start_raw,
        e.created_at
     FROM event e
     LEFT JOIN users u ON e.user_id = u.id
     ORDER BY e.id DESC`,
    (err, events) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání aktualit" });
      if (!events.length) return res.json([]);

      db.query(
        "SELECT * FROM event_photos ORDER BY event_id, sort_order ASC",
        (err2, photos) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při načítání fotek" });

          const result = events.map((event) => ({
            ...event,
            photos: photos.filter((p) => p.event_id === event.id),
          }));

          res.json(result);
        },
      );
    },
  );
});

router.get("/latest", (req, res) => {
  db.query(
    `SELECT 
        e.id,
        e.title,
        e.body,
        e.status,
        e.photo AS cover_photo,
        DATE_FORMAT(e.date_start, '%d.%m.%Y') AS date_start
     FROM event e
     WHERE e.status = 'Availible'
     ORDER BY e.id DESC
     LIMIT 3`,
    (err, events) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání aktualit" });
      if (!events.length) return res.json([]);

      db.query(
        "SELECT * FROM event_photos ORDER BY event_id, sort_order ASC",
        (err2, photos) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při načítání fotek" });

          const result = events.map((event) => ({
            ...event,
            photos: photos.filter((p) => p.event_id === event.id),
          }));

          res.json(result);
        },
      );
    },
  );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT e.*, u.login AS author,
        DATE_FORMAT(e.date_start, '%d.%m.%Y') AS date_start_formatted,
        DATE_FORMAT(e.created_at, '%d.%m.%Y') AS created_at_formatted,
        e.date_start AS date_start_raw
     FROM event e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.id = ?`,
    [id],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Chyba při načítání aktuality" });
      if (!results.length)
        return res.status(404).json({ error: "Aktualita nenalezena" });

      const event = results[0];

      db.query(
        "SELECT * FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC",
        [id],
        (err2, photos) => {
          if (err2)
            return res.status(500).json({ error: "Chyba při načítání fotek" });
          res.json({ ...event, photos });
        },
      );
    },
  );
});

router.post("/", verifyToken, isAdminOrTrainer, uploadFields, (req, res) => {
  const { title, body, status, date_start, user_id } = req.body;

  if (!title) return res.status(400).json({ error: "Chybí název aktuality" });

  const coverFile = req.files?.cover?.[0];
  const coverPath = coverFile
    ? "/uploads/events/" + coverFile.filename
    : req.body.cover_url || null;

  const photoFiles = req.files?.photos || [];

  db.query(
    `INSERT INTO event (title, body, status, date_start, user_id, photo) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      body || null,
      status || "Availible",
      date_start || null,
      req.user.id,
      coverPath,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Chyba při ukládání aktuality" });

      const eventId = result.insertId;

      if (photoFiles.length > 0) {
        const photoValues = photoFiles.map((file, index) => [
          eventId,
          "/uploads/events/" + file.filename,
          index,
        ]);

        db.query(
          "INSERT INTO event_photos (event_id, img_path, sort_order) VALUES ?",
          [photoValues],
          (err2) => {
            if (err2) console.error("Chyba při ukládání fotek galerie:", err2);
          },
        );
      }

      res.status(201).json({
        success: true,
        message: "Aktualita byla úspěšně přidána",
        id: eventId,
      });
    },
  );
});

router.put("/:id", verifyToken, isAdminOrTrainer, uploadFields, (req, res) => {
  const { id } = req.params;
  const { title, body, status, date_start } = req.body;

  if (!title) return res.status(400).json({ error: "Chybí název aktuality" });

  const coverFile = req.files?.cover?.[0];
  const photoFiles = req.files?.photos || [];

  const updateQuery = coverFile
    ? `UPDATE event SET title=?, body=?, status=?, date_start=?, photo=? WHERE id=?`
    : `UPDATE event SET title=?, body=?, status=?, date_start=? WHERE id=?`;

  const updateParams = coverFile
    ? [
        title,
        body || null,
        status || "Availible",
        date_start || null,
        "/uploads/events/" + coverFile.filename,
        id,
      ]
    : [title, body || null, status || "Availible", date_start || null, id];

  db.query(updateQuery, updateParams, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Chyba při aktualizaci aktuality" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Aktualita nenalezena" });

    if (photoFiles.length > 0) {
      db.query(
        "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM event_photos WHERE event_id = ?",
        [id],
        (err2, rows) => {
          if (err2) return;
          const startOrder = rows[0].maxOrder + 1;
          const photoValues = photoFiles.map((file, index) => [
            id,
            "/uploads/events/" + file.filename,
            startOrder + index,
          ]);
          db.query(
            "INSERT INTO event_photos (event_id, img_path, sort_order) VALUES ?",
            [photoValues],
          );
        },
      );
    }

    res.json({ success: true, message: "Aktualita byla úspěšně upravena" });
  });
});

router.delete("/photo/:photoId", verifyToken, isAdminOrTrainer, (req, res) => {
  const { photoId } = req.params;

  db.query(
    "SELECT img_path FROM event_photos WHERE id = ?",
    [photoId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Chyba serveru" });
      if (!results.length)
        return res.status(404).json({ error: "Fotka nenalezena" });

      db.query("DELETE FROM event_photos WHERE id = ?", [photoId], (err2) => {
        if (err2)
          return res.status(500).json({ error: "Chyba při mazání fotky" });

        const fullPath = getFilePath(results[0].img_path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

        res.json({ success: true, message: "Fotka byla smazána" });
      });
    },
  );
});

router.delete("/:id", verifyToken, isAdminOrTrainer, (req, res) => {
  const { id } = req.params;

  db.query("SELECT photo FROM event WHERE id = ?", [id], (err, eventRows) => {
    db.query(
      "SELECT img_path FROM event_photos WHERE event_id = ?",
      [id],
      (err2, photos) => {
        db.query("DELETE FROM event WHERE id = ?", [id], (err3, result) => {
          if (err3)
            return res
              .status(500)
              .json({ error: "Chyba při mazání aktuality" });
          if (result.affectedRows === 0)
            return res.status(404).json({ error: "Aktualita nenalezena" });

          if (eventRows?.[0]?.photo) {
            const coverPath = getFilePath(eventRows[0].photo);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
          }

          if (photos) {
            photos.forEach((photo) => {
              const fullPath = getFilePath(photo.img_path);
              if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
          }

          res.json({ success: true, message: "Aktualita byla smazána" });
        });
      },
    );
  });
});

module.exports = router;
