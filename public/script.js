(function() {
    console.log("check check");
    let canvas = document.querySelector("#signature-field");
    let c = canvas.getContext("2d");
    // console.log(canvas);
    c.strokeStyle = "black";
    c.lineWidth = 2;
    // var canvasInput = ;
    let x;
    let y;
    let sign = false;

    canvas.addEventListener("mousedown", function(evt) {
        console.log("evt mousedown: ", evt);
        x = evt.offsetX;
        y = evt.offsetY;
        sign = true;
        c.beginPath();

        canvas.addEventListener("mousemove", function(evt) {
            console.log("evt mousemove: ", evt);
            if (sign) {
                c.moveTo(x, y);
                y = evt.offsetY;
                x = evt.offsetX;
                c.lineTo(x, y);
                c.stroke();
            }
        });
    });
})();
