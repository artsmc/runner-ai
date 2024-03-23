'use strict'
class PixiApp {
  app;
  offset;
  shapes = [];
  constructor() {
    this.offset = 200;
    this.app = this.initApp();
    this.shapes = [];
  }
  async initApp() {
    const app = new PIXI.Application();
    await app.init({ width: window.innerWidth, height: window.innerHeight, backgroundAlpha: 0, resizeTo: window });
    document.getElementById('stage').appendChild(app.canvas);
    return app;
  }
  movingStageWithShape(shape, stage) {
    stage.x = (shape.x+40 - window.innerWidth / 2) * -1;
  }
  findShapeById(id) {
    let shape = this.shapes.find(shape => shape.name === id);
    return shape ? shape : null;
  }
  /**
   * Cubic interpolation based on https://github.com/osuushi/Smooth.js
  */

  animateOnTimeline(app, time) { }
}
const myPixiApp = new PixiApp();
$(document).ready(async function () {
  const god = new Shape({
    name: "God",
    offset: 100,
    friction: 0.9,
    color: '#fcec03',
    size: 35,
    trail: true
  });
  god.init();
  window.myPixiApp = myPixiApp;
  myPixiApp.app.then(async app => {
    const mainShape = await god.shape;
    app.ticker.add((time) => {
      myPixiApp.movingStageWithShape(mainShape, app.stage);
    });
  })


});



class Shape {
  shape;
  interval;
  constructor({ name, offset, friction, historySize, ropeSize, color, size, trail }) {
    this.name = name;
    this.offset = offset;
    this.trail = trail;
    this.size = size || 20;
    this.friction = friction;
    this.color = color;
    this.historySize = historySize || 150;
    this.ropeSize = ropeSize || 100;
    this.historyX = [];
    this.historyY = [];
    this.points = [];
    this.interval = undefined;
    myPixiApp.shapes.push(this);
  }


  async init() {
    const circle = new PIXI.Graphics()
      .circle(this.size, this.size, this.size)
      .fill(this.color);
    this.shape = circle;
    circle.x = window.innerWidth / 3;
    // Create history array.
    for (let i = 0; i < this.historySize; i++) {
      this.historyX.push(circle.x);
      this.historyY.push(circle.y);
    }
    // Create rope points.
    for (let i = 0; i < this.ropeSize; i++) {
      this.points.push(new PIXI.Point(0, 0));
    }
    // Load the texture for rope.
    const trailTexture = await PIXI.Assets.load('images/trail.png');
    // Create the rope
    const rope = new PIXI.MeshRope({ texture: trailTexture, points: this.points });

    // Set the blendmode
    rope.blendmode = 'add';

    myPixiApp.app.then(async app => {
      if(this.trail) {
        app.stage.addChild(rope);
      }
      
      app.stage.addChild(circle);
      // app.stage.eventMode = 'static';
      // app.stage.hitArea = app.screen;
      app.ticker.add((time) => {
        this.historyX.pop();
        this.historyX.unshift(circle.x + this.size);
        this.historyY.pop();
        this.historyY.unshift(circle.y + this.size);
        // Update the points to correspond with history.
        for (let i = 0; i < this.ropeSize; i++) {
          const p = this.points[i];
          // Smooth the curve with cubic interpolation to prevent sharp edges.
          const ix = this.cubicInterpolation(this.historyX, (i / this.ropeSize) * this.historySize);
          const iy = this.cubicInterpolation(this.historyY, (i / this.ropeSize) * this.historySize);
          p.x = ix;
          p.y = iy;
        }
        this.animateCircle(circle, time.lastTime);
      });
    });
  }
  animateCircle(circle, elapsedMS) {
    const defaultSpeed = 1; // Default speed of the animation
    const defaultAmplitude = 70; // Default amplitude of the sine wave
    const defaultFriction = this.friction || 0.95; // Default friction factor
    const defaultOffset = this.offset || 100; // Default offset

    // Calculate amplitude based on the offset distance
    const amplitudePercentage = Math.abs(defaultOffset - 100) / 100; // Calculate the percentage difference from defaultOffset to 100
    const amplitudeFactor = 1 + amplitudePercentage; // The factor by which to multiply the default amplitude
    const amplitude = defaultAmplitude * amplitudeFactor; // Adjust the amplitude based on the offset

    // Calculate friction based on the offset distance
    const frictionPercentage = Math.abs(defaultOffset - 100) / 100; // Calculate the percentage difference from defaultOffset to 100
    const maxFriction = 0.99; // Maximum friction allowed
    const friction = defaultFriction + (maxFriction - defaultFriction) * frictionPercentage; // Adjust friction dynamically

    const speed = (circle.speed !== undefined && circle.speed >= 1 && circle.speed <= 100) ? circle.speed / 1000 : defaultSpeed / 1000;
    const displacement = amplitude * Math.sin(speed * elapsedMS);

    // Apply friction to slow down the movement
    const easedDisplacement = displacement * friction;

    // Update circle's y-coordinate
    circle.y = easedDisplacement + defaultOffset;
    circle.x = circle.x + (speed * 5000);
  }

  shiftShape(shiftTo) {
    console.log('Shifting shape', { offset: this.offset, moveTo: shiftTo });
    // Clear the previous interval if it exists
    if (this.interval) {
      clearInterval(this.interval);
    }
    const shift = shiftTo < this.offset ? -3 : 1;
    this.interval = setInterval(() => {
      this.offset = shift === 1 ? this.offset + 1 : this.offset - 3;
      if ((shift === 1 && this.offset >= shiftTo) || (shift === -3 && this.offset <= shiftTo)) {
        clearInterval(this.interval);
      }
    }, 100);
  }
  clipInput(k, arr) {
    if (k < 0) k = 0;
    if (k > arr.length - 1) k = arr.length - 1;
    return arr[k];
  }
  getTangent(k, factor, array) {
    return (factor * (this.clipInput(k + 1, array) - this.clipInput(k - 1, array))) / 2;
  }
  cubicInterpolation(array, t, tangentFactor = 1) {
    const k = Math.floor(t);
    const m = [this.getTangent(k, tangentFactor, array), this.getTangent(k + 1, tangentFactor, array)];
    const p = [this.clipInput(k, array), this.clipInput(k + 1, array)];
    t -= k;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
  }
}

