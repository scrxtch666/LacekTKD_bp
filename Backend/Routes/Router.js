const express = require("express");
const router = express.Router();

const eventRouter = require("./Events/RouterEvents");
const tournamentRouter = require("./Tournaments/RouterTournaments");
const beltRouter = require("./Belts/RouterBelts");
const fightersRouter = require("./Fighters/RouterFighters");
const newsRouter = require("./News/RouterNews");
const usersRouter = require("./Users/RouterUsers");
const sponsorsRouter = require("./Sponsors/RouterSponsors");
const bannerRouter = require("./Banner/RouterBanner");
const roleRouter = require("./Roles/RouterRoles");
const categoryRouter = require("./Category/RouterCategory");
const trainingRouter = require("./Trainings/RouterTrainings");
const tournamentRegistrationRouter = require("./TournamentRegistration/RouterTournamentRegistration");
const examRouter = require("./Exams/RouterExams");

// Registrace routerů
router.use("/events", eventRouter);
router.use("/tournaments", tournamentRouter);
router.use("/belts", beltRouter);
router.use("/fighters", fightersRouter);
router.use("/users", usersRouter);
router.use("/sponsors", sponsorsRouter);
router.use("/news", newsRouter);
router.use("/banner", bannerRouter);
router.use("/roles", roleRouter);
router.use("/category", categoryRouter);
router.use("/trainings", trainingRouter);
router.use("/tournamentRegistration", tournamentRegistrationRouter);
router.use("/exams", examRouter);


module.exports = router;