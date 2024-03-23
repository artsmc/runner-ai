requirejs(
    [
        "handlebars",
        "app",
        "vendor",
        "jquery",
        "global"
    ],
    function (util) {
        requirejs(["fit","pixi.app", "owl.carousel.min"], function (konvaStage) {
            requirejs(["home"], function (splineApp) {
                
            })
        });
    }
);
