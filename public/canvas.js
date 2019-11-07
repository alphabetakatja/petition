(function() {
    console.log("check check");
    let canvas = document.querySelector("#signature-field");
    let c = canvas.getContext("2d");
    let canvasInput = document.querySelector(".hidden-field");
    let signature = canvasInput.value;
    let submit = document.querySelector(".submit-btn");

    c.strokeStyle = "black";
    c.lineWidth = 2;

    let x;
    let y;
    let sign = false;
    let dataURL;

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
        // when user mouses up, we need to call canvas's toDataUrl method to convert the drawing to a url
        // once we have the url we need to store that url as the value of the hidden input field
        canvas.addEventListener("mouseup", function() {
            sign = false;
            dataURL = canvas.toDataURL();
            console.log(dataURL);
            signature = dataURL;
            console.log(signature);
        });

        submit.addEventListener("click", function(evt) {
            // we need to send the signature to the db
            console.log("this is submit: ", evt);
        });
    });
})();