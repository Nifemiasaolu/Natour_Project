const express = require("express")
const viewController = require("../controllers/viewController")

const router = express.Router()

router.get("/overview", viewController.getOverview)
app.get("/tour", viewController.getTourDetail)

module.exports = router;
