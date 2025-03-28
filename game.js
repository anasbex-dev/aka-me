import { createController } from "./controller.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = { x: 100, y: 100, width: 32, height: 32 };
const range = 160;
const npc1 = new AiNpc2D({
  x: 400,
  y: 200,
  speed: 0.5,
  targetPlayer: player,
  chaseRange: 160,
  stopDistance: 100,
  escapeRange: 100,
  waypoints: [{ x: 300, y: 300 }, { x: 400, y: 100 }]
});

const npc = new AiNpc2D({
  x: 200,
  y: 200,
  speed: 0.5,
  targetPlayer: player,
  chaseRange: range,
  stopDistance: 50,
  escapeRange: 100,
  waypoints: [{ x: 300, y: 300 }, { x: 400, y: 100 }]
});

const npcs = [npc]; // ✅ Memastikan NPC dalam array

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  npc.update(npcs); // ✅ Pastikan NPC menerima array
  npc.draw(ctx);
  
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  requestAnimationFrame(gameLoop);
}

const controller = createController("touch");

controller.on("input", (data) => {
  console.log(data); // Debugging event yang diterima
  
  if (data.type === "swipe") {
    if (data.direction === "up") npc.moveToTarget({ x: npc.x, y: npc.y - 10 });
    if (data.direction === "down") npc.moveToTarget({ x: npc.x, y: npc.y + 10 });
    if (data.direction === "left") npc.moveToTarget({ x: npc.x - 10, y: npc.y });
    if (data.direction === "right") npc.moveToTarget({ x: npc.x + 10, y: npc.y });
  }
  
  if (data.type === "tap") {
    console.log("NPC Interact!");
  }
  
  if (data.type === "hold") {
    console.log("NPC Running!");
    npc.moveToTarget({ x: npc.x, y: npc.y - 450 });
    const range = 50;
  }
});

gameLoop();