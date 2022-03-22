const path = require("path");
const express = require('express');
const router = express.Router();

router.use(express.static(path.resolve(__dirname, '../../client/build')))


router.get('/', (req, res) => {
    console.log("main page!");
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
});

router.get('*', (req, res) => {
    res.status(404).send('Page not found');
});


module.exports = router;