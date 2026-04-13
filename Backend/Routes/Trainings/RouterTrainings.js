const app = require("express");
const router = app.Router();
const db = require("../../Libs/db")

router.get('/', async(req, res) => {
            db.query(`SELECT 
            id, 
            day_start, day_end, type,
            TIME_FORMAT(time_start, '%H:%i') AS time_start, 
            TIME_FORMAT(time_end, '%H:%i') AS time_end
            
        FROM trainings`, (err, results) => {
              if (err) return res.status(500).json({ error: 'Chyba při načítání tréninků' });
              res.json(results);
        })
});


module.exports = router;