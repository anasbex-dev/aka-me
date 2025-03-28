class Controller {
  constructor() {
    this.events = {}; // Sistem event listener
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  trigger(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// 🔥 Keyboard Controller
class KeyboardController extends Controller {
  constructor() {
    super();
    this.keys = {};
    
    window.addEventListener("keydown", (e) => {
      if (!this.keys[e.code]) {
        this.keys[e.code] = true;
        this.trigger("input", { type: "keydown", key: e.code });
      }
    });
    
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      this.trigger("input", { type: "keyup", key: e.code });
    });
  }
}

// 🔥 Touch Controller
class TouchController extends Controller {
  constructor() {
    super();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    
    window.addEventListener("touchstart", (e) => {
      let touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
    });
    
    window.addEventListener("touchmove", (e) => {
      let touch = e.touches[0];
      let dx = touch.clientX - this.touchStartX;
      let dy = touch.clientY - this.touchStartY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        this.trigger("input", { type: "swipe", direction: dx > 0 ? "right" : "left" });
      } else {
        this.trigger("input", { type: "swipe", direction: dy > 0 ? "down" : "up" });
      }
      
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    });
    
    window.addEventListener("touchend", (e) => {
      let touchTime = Date.now() - this.touchStartTime;
      
      if (touchTime < 200) {
        this.trigger("input", { type: "tap" });
      } else {
        this.trigger("input", { type: "hold" });
      }
    });
  }
}

// 🔥 Factory untuk memilih input controller yang sesuai
function createController(type = "keyboard") {
  if (type === "touch") {
    return new TouchController();
  }
  return new KeyboardController();
}

export { createController };