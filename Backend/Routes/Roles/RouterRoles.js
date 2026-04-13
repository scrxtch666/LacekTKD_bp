const app = require("express");
const router = app.Router();
const db = require("../../Libs/db")

router.get('/', async(req, res) => {
            db.query(`SELECT *
         FROM role`, (err, results) => {
              if (err) return res.status(500).json({ error: 'Chyba při načítání rolí' });
              res.json(results);
        })
});


module.exports = router;