const fs = require("fs");
const { Eta } = require("eta");
const { watch, series } = require("gulp");
const { Marked } = require("marked");
const concat = require("concat-files");
const server = require("node-http-server");

const eta = new Eta({
    views: __dirname + "/src",
});

const marked = new Marked();

const gamesDir = __dirname + "/src/games";
const sourceDir = __dirname + "/src";
const outputDir = __dirname + "/dist";

// Wczytywanie gier z podfolderu `games`.
const games = fs
    .readdirSync(gamesDir)
    .filter((filename) => {
        return fs.statSync(gamesDir + "/" + filename).isDirectory();
    })
    .filter((name) => name !== "_template")
    .map((name) => {
        const config = require(gamesDir + "/" + name + "/config.json");
        return {
            name,
            title: config.title,
            extraJsFiles: config.extraJsFiles ?? []
        };
    });

function renderHtmlFiles(cb) {
    // Generowanie statycznych stron.
    fs.writeFileSync(outputDir + "/index.html", eta.render("views/main-page.html", { games, addGameCSS: false }));

    // Generowanie statycznych strong gier (nazwa gry, sekcja autorska, opis).
    for (let game of games) {
        fs.writeFileSync(
            outputDir + "/" + game.name + ".game.html",
            eta.render("views/game.html", {
                games,
                addGameCSS: true,
                name: game.name,
                title: game.title,
                authors: marked.parse(fs.readFileSync(gamesDir + "/" + game.name + "/content/authors.md", "utf8")),
                description: marked.parse(
                    fs.readFileSync(gamesDir + "/" + game.name + "/content/description.md", "utf8")
                ),
            })
        );
    }

    // Gulp.
    cb();
}

function copyAssets(cb) {
    // Kopiowanie ogólnych zasobów.
    fs.cpSync(sourceDir + "/images", __dirname + "/dist/images", {
        recursive: true,
    });

    // Kopiowanie zasobów gier (CSS oraz obrazki).
    for (let game of games) {
        fs.cpSync(gamesDir + "/" + game.name + "/css", __dirname + "/dist/css/" + game.name, {
            recursive: true,
        });
        fs.cpSync(gamesDir + "/" + game.name + "/images", __dirname + "/dist/images/" + game.name, {
            recursive: true,
        });
    }

    // Gulp.
    cb();
}

function concatScripts(cb) {
    // Łączenie skryptów dla gier.
    for (let game of games) {
        if (fs.existsSync(outputDir + "/js/" + game.name) === false) {
            fs.mkdirSync(outputDir + "/js/" + game.name, { recursive: true });
        }
        concat(
            game.extraJsFiles.map(file => {
                return gamesDir + "/" + game.name + "/js/" + file;
            }).concat([
                sourceDir + "/game.pre.js",
                gamesDir + "/" + game.name + "/js/game.logic.js",
                gamesDir + "/" + game.name + "/js/game.visualization.js",
                sourceDir + "/game.post.js",
            ]),
            outputDir + "/js/" + game.name + "/game.js"
        );
        concat(
            [
                sourceDir + "/game.pre.js",
                gamesDir + "/" + game.name + "/js/game.logic.js",
                sourceDir + "/alphabeta.js",
            ],
            outputDir + "/js/" + game.name + "/alphabeta.js"
        );
    }

    // Gulp.
    cb();
}

exports.build = series(renderHtmlFiles, copyAssets, concatScripts);

exports.default = function () {
    renderHtmlFiles(() => {});
    copyAssets(() => {});
    concatScripts(() => {});
    watch(["src/views/*.html"], renderHtmlFiles);
    watch(["src/games/**/*.md"], renderHtmlFiles);
    watch(["src/images/**/*.*"], copyAssets);
    watch(["src/games/*/images/**/*.*"], copyAssets);
    watch(["src/games/*/css/**/*.*"], copyAssets);
    watch(["src/**/*.js"], concatScripts);
    watch(["src/games/*/js/**/*.js"], concatScripts);
    server.deploy(
        {
            port: 8000,
            root: 'dist/'
        },
        () => {
            console.log("Platforma została uruchomiona pod adresem http://localhost:8000");
        }
    );
};
