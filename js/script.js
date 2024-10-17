const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pi = Math.PI;

const image = new Image();
image.src = "image/farm.png";
image.onload = function() {
    renderLoop(); 
    fixDpiResizeCanvas()
};

let gradient;

function fixDpiResizeCanvas() {  
    canvas.width = window.innerWidth ;
    canvas.height = window.innerHeight;
    // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    gradient = ctx.createLinearGradient(0, canvas.width, canvas.height, 0);
    gradient.addColorStop(0, "#D9BBA0");
    gradient.addColorStop(1, "#5B3A29");
}
fixDpiResizeCanvas();
window.addEventListener("resize", fixDpiResizeCanvas);

var positions = {
    // Here, fixed is the outer circle and inner is the small circle that moves
    fixedX: undefined,
    fixedY: undefined,
    innerX: undefined,
    innerY: undefined,
};

var angle = undefined;

function touchStart(x, y) {
    if (positions.fixedX || positions.fixedY) return;
    positions.fixedX = positions.innerX = x;
    positions.fixedY = positions.innerY = y;
}

function touchMove(x, y) {
    if (!(positions.fixedX || positions.fixedY)) return;

    positions.innerX = x;
    positions.innerY = y;

    angle = Math.atan2(
        positions.innerY - positions.fixedY,
        positions.innerX - positions.fixedX
    );

    if (!((x - positions.fixedX) ** 2 + (y - positions.fixedY) ** 2 < 10000)) {
        positions.innerX = Math.round(Math.cos(angle) * 100 + positions.fixedX);
        positions.innerY = Math.round(Math.sin(angle) * 100 + positions.fixedY);
    }
}

function touchEndOrCancel() {
    positions.fixedX =
        positions.fixedY =
        positions.innerX =
        positions.innerY =
        angle =
        undefined;
}

canvas.addEventListener("touchstart", function (e) {
    touchStart(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener("touchmove", function (e) {
    touchMove(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener("touchend", touchEndOrCancel);
canvas.addEventListener("touchcancel", touchEndOrCancel);

// TODO: test mouse on pc
canvas.addEventListener("mousedown", function (e) {
    touchStart(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", function (e) {
    touchMove(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", touchEndOrCancel);

function renderLoop() {
    requestAnimationFrame(renderLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rita bakgrundsfärgen
    if (gradient) {
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Rita bakgrundsbilden
    if (image.complete) {

        const imageWidth = image.width;  
        const imageHeight = image.height;
        const imageScaleFactor = 2; 

        const x = (canvas.width - imageWidth * imageScaleFactor) / 2; 
        const y = (canvas.height - imageHeight * imageScaleFactor) / 2;

        ctx.drawImage(image, x, y, imageWidth * imageScaleFactor, imageHeight * imageScaleFactor);
    }

    var displayAngle = (-angle + 2 * pi) % (2 * pi);

    ctx.fillStyle = "#0008";

    if (!(positions.fixedX || positions.fixedY)) {
        ctx.fillText("Touch the screen", 20, 20);
        return;
    }

    ctx.fillText(
        `Angle: ${Math.round((displayAngle * 180) / pi)} degrees (${Math.round(displayAngle * 100) / 100} radians)`,
        20,
        20
    );

    ctx.fillText(
        `Raw angle: ${Math.round(angle * 100) / 100} radians (inverted Y axis)`,
        20,
        50
    );
    ctx.fillText(
        `Inner joystick: (${positions.innerX},${positions.innerY})`,
        20,
        80
    );
    ctx.fillText(
        `Touch start point: (${positions.fixedX},${positions.fixedY}) or (${Math.round((positions.fixedX / window.innerWidth) * 1000) / 1000},${Math.round((positions.fixedY / window.innerHeight) * 1000) / 1000})`,
        20,
        110
    );

    // Draw joystick outer circle
    ctx.beginPath();
    ctx.fillStyle = "#0004";
    ctx.arc(positions.fixedX, positions.fixedY, 100, 0, 2 * pi);
    ctx.fill();
    ctx.closePath();

    // Draw inner circle
    ctx.beginPath();
    ctx.fillStyle = "#0008";
    ctx.arc(positions.innerX, positions.innerY, 30, 0, 2 * pi);
    ctx.fill();
    ctx.closePath();
}



renderLoop();

ctx.font = "20px Helvetica";
ctx.textBaseline = "top";
