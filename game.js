import Controller from "./controller.js";

const controller = new Controller();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

controller.setAnalogConfig(150, 450, 120, 50);
controller.setAnalogImages("analog_base.png", "analog_stick.png");

function update() {
    controller.updateGamepad();
    let analog = controller.getAnalog();

    let moveX = analog.x;
    let moveY = analog.y;

    console.log("Analog X:", moveX, "Analog Y:", moveY);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    controller.drawAnalog(ctx);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();