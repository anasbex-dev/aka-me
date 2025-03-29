class Controller { constructor(customKeymap = {}, customGamepadMap = {}) { this.keys = {}; this.gamepad = null; this.analog = { x: 0, y: 0, dragging: false, baseX: 100, baseY: 400, radius: 100, touchX: 0, touchY: 0 }; this.buttons = {}; this.touchAreas = {}; this.buttonImages = {}; this.analogImages = { base: null, stick: null };

this.keymap = {
        "left": "ArrowLeft",
        "right": "ArrowRight",
        "up": "ArrowUp",
        "down": "ArrowDown",
        "attack": "Space",
        ...customKeymap
    };

    this.gamepadMap = {
        "left": 14,
        "right": 15,
        "up": 12,
        "down": 13,
        "attack": 0,
        ...customGamepadMap
    };

    this._setupKeyboard();
    this._setupGamepad();
    this._setupTouchControls();
}

_setupKeyboard() {
    window.addEventListener("keydown", (e) => {
        this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
    });
}

_setupGamepad() {
    window.addEventListener("gamepadconnected", (e) => {
        this.gamepad = e.gamepad;
    });
    window.addEventListener("gamepaddisconnected", () => {
        this.gamepad = null;
    });
}

_setupTouchControls() {
  this.buttons["attack"] = false;
  
  // Dapatkan referensi ke canvas
  const canvas = document.getElementById("gameCanvas");
  
  window.addEventListener("touchstart", (event) => {
    // Dapatkan posisi canvas di layar
    const rect = canvas.getBoundingClientRect();
    
    for (let touch of event.touches) {
      // Sesuaikan koordinat sentuh dengan posisi canvas
      let x = touch.clientX - rect.left;
      let y = touch.clientY - rect.top;
      
      // Posisi stick saat ini
      let stickX = this.analog.baseX + this.analog.touchX;
      let stickY = this.analog.baseY + this.analog.touchY;
      
      // Ukuran area stick (sesuaikan dengan ukuran visual stick)
      let stickRadius = 20; // Berdasarkan gambar, stick terlihat kecil (~20px)
      
      // Hitung jarak dari sentuhan ke pusat stick
      let dx = x - stickX;
      let dy = y - stickY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let isInStick = distance <= stickRadius;
      
      console.log(`Touch at (${x}, ${y}), Stick at (${stickX}, ${stickY}), Distance: ${distance}, Stick Radius: ${stickRadius}`);
      
      if (isInStick) {
        this.analog.dragging = true;
        this.analog.touchX = x - this.analog.baseX;
        this.analog.touchY = y - this.analog.baseY;
        
        let baseDistance = Math.sqrt(this.analog.touchX * this.analog.touchX + this.analog.touchY * this.analog.touchY);
        if (baseDistance > this.analog.radius) {
          this.analog.touchX = (this.analog.touchX / baseDistance) * this.analog.radius;
          this.analog.touchY = (this.analog.touchY / baseDistance) * this.analog.radius;
        }
        
        this.analog.x = this.analog.touchX / this.analog.radius;
        this.analog.y = this.analog.touchY / this.analog.radius;
        console.log("Joystick activated:", this.analog);
      } else {
        Object.keys(this.touchAreas).forEach(action => {
          let area = this.touchAreas[action];
          if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
            this.buttons[action] = true;
            console.log(`Button ${action} pressed`);
          }
        });
      }
    }
  });
  
  window.addEventListener("touchmove", (event) => {
    if (this.analog.dragging) {
      const rect = canvas.getBoundingClientRect();
      let touch = event.touches[0];
      let x = touch.clientX - rect.left;
      let y = touch.clientY - rect.top;
      
      let dx = x - this.analog.baseX;
      let dy = y - this.analog.baseY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > this.analog.radius) {
        dx = (dx / distance) * this.analog.radius;
        dy = (dy / distance) * this.analog.radius;
      }
      
      this.analog.touchX = dx;
      this.analog.touchY = dy;
      this.analog.x = dx / this.analog.radius;
      this.analog.y = dy / this.analog.radius;
      console.log("Joystick moved:", this.analog);
    }
  });
  
  window.addEventListener("touchend", () => {
    this.analog.dragging = false;
    this.analog.x = 0;
    this.analog.y = 0;
    this.analog.touchX = 0;
    this.analog.touchY = 0;
    console.log("Touch ended, joystick reset");
    
    Object.keys(this.buttons).forEach(action => {
      this.buttons[action] = false;
    });
  });
}
updateGamepad() {
    if (this.gamepad) {
        let gp = navigator.getGamepads()[this.gamepad.index];
        this.analog.x = gp.axes[0];
        this.analog.y = gp.axes[1];

        Object.keys(this.gamepadMap).forEach(action => {
            let buttonIndex = this.gamepadMap[action];
            this.buttons[action] = gp.buttons[buttonIndex]?.pressed || false;
        });
    }
}

getAnalog() {
    return this.analog;
}

isPressed(action) {
    return this.keys[this.keymap[action]] || this.buttons[action] || false;
}

setTouchArea(action, x, y, w, h, imageSrc = null) {
    this.touchAreas[action] = { x, y, w, h };
    
    if (imageSrc) {
        let img = new Image();
        img.src = imageSrc;
        this.buttonImages[action] = img;
    }
}

setAnalogArea(x, y, radius) {
    this.analog.baseX = x;
    this.analog.baseY = y;
    this.analog.radius = radius;
}

setAnalogImages(baseSrc, stickSrc) {
    if (baseSrc) {
        let img = new Image();
        img.src = baseSrc;
        this.analogImages.base = img;
    }
    if (stickSrc) {
        let img = new Image();
        img.src = stickSrc;
        this.analogImages.stick = img;
    }
}

drawAnalog(ctx) {
    let baseX = this.analog.baseX;
    let baseY = this.analog.baseY;
    let stickX = baseX + this.analog.touchX;
    let stickY = baseY + this.analog.touchY;

    if (this.analogImages.base) {
        ctx.drawImage(this.analogImages.base, baseX - this.analog.radius, baseY - this.analog.radius, this.analog.radius * 2, this.analog.radius * 2);
    } else {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(baseX, baseY, this.analog.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (this.analogImages.stick) {
        ctx.drawImage(this.analogImages.stick, stickX - this.analog.radius / 2, stickY - this.analog.radius / 2, this.analog.radius, this.analog.radius);
    } else {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(stickX, stickY, this.analog.radius / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

}

export default Controller;