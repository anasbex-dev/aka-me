class AiNpc2D {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 32;
    this.height = config.height || 32;
    this.speed = config.speed || 1.5;
    this.state = "idle";
    
    // 🔥 MULTI SPRITE SUPPORT
    this.sprites = config.sprites || {};
    this.currentAction = "idle";
    this.currentSprite = this.sprites[this.currentAction] || null;
    
    // 🔥 FRAME ANIMATION
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameSpeed = config.frameSpeed || 10;
    this.totalFrames = config.totalFrames || 4;
    
    // 🔥 SYSTEM MOOD & KETAKUTAN
    this.mood = "neutral"; // neutral, happy, scared, angry
    this.fearThreshold = config.fearThreshold || 50;
    this.isScared = false;
    
    // 🔥 CHASE & ESCAPE SYSTEM
    this.targetPlayer = config.targetPlayer || null;
    this.chaseRange = config.chaseRange || 100;
    this.escapeRange = config.escapeRange || 50;
    
    // 🔥 WAYPOINT SYSTEM
    this.waypoints = config.waypoints || [];
    this.currentWaypointIndex = 0;
    this.isMovingToWaypoint = false;
    
    // 🔥 NPC INTERACTION SYSTEM
    this.npcInteractions = config.npcInteractions || {};
    this.inventory = config.inventory || [];
    this.money = config.money || 100;
    
    // 🔥 NPC SCHEDULE SYSTEM
    this.schedule = config.schedule || [];
    this.currentScheduleIndex = 0;
    
    // 🔥 NPC ACTIVITY TIMER
    this.restTimer = 0;
    this.isResting = false;
  }
  
  setAction(action) {
    if (this.sprites[action]) {
      this.currentAction = action;
      this.currentSprite = this.sprites[action];
      this.frameX = 0;
    }
  }
  
  updateAnimation() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % this.totalFrames; // Loop animasi
    }
  }
  
  moveToTarget(target) {
    if (!target) return;
    
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
      this.setAction("walk");
    } else {
      this.setAction("idle");
    }
  }
  
  chasePlayer() {
    if (this.targetPlayer) {
      let dx = this.targetPlayer.x - this.x;
      let dy = this.targetPlayer.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.chaseRange) {
        this.moveToTarget(this.targetPlayer);
      }
    }
  }
  
  escapeFromPlayer() {
    if (this.isScared && this.targetPlayer) {
      let dx = this.x - this.targetPlayer.x;
      let dy = this.y - this.targetPlayer.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.escapeRange) {
        let escapeDirX = dx / distance;
        let escapeDirY = dy / distance;
        
        this.x += escapeDirX * this.speed * 2; // Lari lebih cepat dari normal
        this.y += escapeDirY * this.speed * 2;
        this.setAction("run");
      }
    }
  }
  
  followSchedule() {
    if (this.schedule.length > 0) {
      let currentTask = this.schedule[this.currentScheduleIndex];
      let dx = currentTask.location.x - this.x;
      let dy = currentTask.location.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (currentTask.type === "move") {
        this.moveToTarget(currentTask.location);
      } else if (currentTask.type === "rest") {
        this.isResting = true;
        this.restTimer = currentTask.duration;
      }
      
      if (distance < 3) { // **Fix**: Tidak pakai `===` karena posisi bisa float
        this.currentScheduleIndex = (this.currentScheduleIndex + 1) % this.schedule.length;
      }
    }
  }
  
  interactWithNpc(npcs) {
    for (let npc of npcs) {
      if (npc !== this && npc.name && this.name) { // **Fix**: Pastikan NPC punya nama
        let dx = npc.x - this.x;
        let dy = npc.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          let interactionKey = `${this.name}-${npc.name}`;
          if (this.npcInteractions[interactionKey]) {
            this.npcInteractions[interactionKey](this, npc);
          }
        }
      }
    }
  }
  
  update(npcs) {
    if (this.targetPlayer) {
      this.chasePlayer();
    }
    
    if (this.isScared) {
      this.escapeFromPlayer();
    }
    
    this.followSchedule();
    this.interactWithNpc(npcs);
    
    if (this.restTimer > 0) {
      this.restTimer--;
      if (this.restTimer <= 0) {
        this.isResting = false;
      }
    }
  }
  
  draw(ctx) {
    this.updateAnimation();
    if (this.currentSprite) {
      ctx.drawImage(
        this.currentSprite,
        this.frameX * this.width, 0, this.width, this.height,
        this.x, this.y,
        this.width, this.height
      );
    } else {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}