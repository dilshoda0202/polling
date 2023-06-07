const express = require('express');
const app = express();
const axios = require('axios');
// const ejsLayouts = require('express-ejs-layout');

// app.set('view engine', 'ejs');
// app.use(ejsLayouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));








const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, function () {
    console.log(`Server is running on PORT`, PORT);
});

module.exports = {
    server,
    app,
    PORT,
    axios
};