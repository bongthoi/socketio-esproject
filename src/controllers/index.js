import express from 'express';



let router = express.Router();

/**public */
router.get("/", (req, res) => {
	res.render("index", { title: "Index" });
});


/**export */
module.exports = router;