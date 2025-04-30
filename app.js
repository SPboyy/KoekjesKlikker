const port = process.env.PORT || 3000;

const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();
const bodyParser = require('body-parser');

// configure Handlebars view engine
app.engine("handlebars", expressHandlebars.engine({
    defaultLayout: "main",
}));
app.set("view engine", "handlebars");

const cookiesRouter = require("./routes/cookies");
app.use("/",cookiesRouter);

app.get("/", (req, res) => {
    res.render("home");
});

app.use(express.static(__dirname + "/public"));
// custom 404 page
app.use((req, res) => {
    res.render("errors/404");
})
// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.message);
    res.render("errors/500");
});
app.listen(port, () => console.log(
    `Express started on http://localhost:${port};  `+
    `press Ctrl-C to terminate.`));

