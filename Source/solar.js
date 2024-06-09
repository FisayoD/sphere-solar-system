// solar.js
// Solar System
// Authors: Juan Malaver, Fisayo Ojo, 2024

"use strict";

class Solar {
  constructor() {
    this.initWebGL();
    this.initShaders();
    this.initPlanets();
    this.initShip();
    this.initAnimation();
    this.initViewSwitch();
    this.render();
  }

  // Initialize the WebGL context
  initWebGL() {
    this.canvas = document.getElementById("gl-canvas");
    this.gl = WebGLUtils.setupWebGL(this.canvas);
    if (!this.gl) {
      alert("WebGL isn't available");
    }
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  // Initialize the shaders
  initShaders() {
    this.program = initShaders(this.gl, "./vshader.glsl", "./fshader.glsl");
    this.gl.useProgram(this.program);
  }

  initPlanets() {
    const colors = [
      // Planets
      [1.0, 0.8, 0.0], // Sun (yellow)
      [0.5, 0.5, 0.5], // Mercury (grey)
      [0.95, 0.87, 0.67], // Venus (pale yellow)
      [0.0, 0.5, 0.5], // Earth (blue-green)
      [1.0, 0.27, 0.0], // Mars (reddish-orange)
      [0.88, 0.63, 0.24], // Jupiter (marbled brown and white)
      [0.8, 0.7, 0.1], // Saturn (golden)
      [0.0, 1.0, 1.0], // Uranus (cyan)
      [0.0, 0.0, 1.0], // Neptune (blue)

      // Moons
      [0.75, 0.75, 0.75], // Moon of Earth (grey)
      [1, 0.8, 0.6], // Europa (light orange)
      [1, 0.6, 0.2], // Io (dark orange)
      [1, 0.3, 0.0], // Ganymede (reddish-brown)
    ];

    // Initialize the solar system
    this.sun = new Planet(
      this.gl,
      this.program,
      8,
      0,
      0,
      0,
      0,
      0,
      colors[0],
      "Images/sun.bmp",
      true
    );

    // Initialize Mercury
    let mercury = this.initializePlanet(
      1,
      10,
      100,
      5,
      0,
      7,
      colors[1],
      "Images/mercury.bmp"
    );
    // mercury.setOrbitPath(50, 100)
    this.sun.attachMoon(mercury);

    // Initialize Venus
    let venus = this.initializePlanet(
      2,
      1,
      50,
      10,
      2,
      7,
      colors[2],
      "Images/venus.bmp"
    );
    // venus.setOrbitPath
    this.sun.attachMoon(venus);

    // Initialize Earth and its moon
    let earth = this.initializePlanet(
      2,
      200,
      15,
      15,
      24,
      7,
      colors[3],
      "Images/earth.bmp"
    );
    let earthMoon = this.initializePlanet(
      0.5,
      100,
      100,
      2,
      7,
      80,
      colors[9],
      "Images/moon.bmp"
    );
    earth.attachMoon(earthMoon);
    // earth.setOrbitPath(50, 100)
    this.sun.attachMoon(earth);

    // Initialize Mars
    let mars = this.initializePlanet(
      2,
      210,
      50,
      20,
      25,
      7,
      colors[4],
      "Images/mars.bmp",
    );
    // mars.setOrbitPath(50, 100)
    this.sun.attachMoon(mars);

    // Initialize Jupiter and its moons
    let jupiter = this.initializePlanet(
      4,
      500,
      5,
      30,
      3,
      7,

      colors[5],
      "Images/jupiter.bmp"
    );
    let jupiterEuropa = this.initializePlanet(
      0.5,
      100,
      100,
      2,
      0,
      10,
      colors[10],
      "Images/moon.bmp"
    );
    let jupiterIo = this.initializePlanet(
      0.25,
      100,
      75,
      2.5,
      0,
      40,
      colors[11],
      "Images/moon.bmp"
    );
    let jupiterGanymede = this.initializePlanet(
      0.75,
      100,
      125,
      3,
      0,
      90,
      colors[12],
      "Images/moon.bmp",
    );
    jupiter.attachMoon(jupiterEuropa);
    jupiter.attachMoon(jupiterIo);
    jupiter.attachMoon(jupiterGanymede);
    this.sun.attachMoon(jupiter);

    // Initialize Saturn
    let saturn = this.initializePlanet(
      4,
      110,
      6,
      40,
      27,
      7,
      colors[6],
      "Images/saturn.bmp"
    );
    saturn.attachRing(2.5, 4, 100, 0);
    // saturn.setOrbitPath(50, 100)
    this.sun.attachMoon(saturn);

    // Initialize Uranus
    let uranus = this.initializePlanet(
      3,
      250,
      2,
      50,
      82,
      7,
      colors[7],
      "Images/uranus.bmp"
    );
    // uranus.setOrbitPath(50, 100)
    this.sun.attachMoon(uranus);

    // Initialize Neptune
    let neptune = this.initializePlanet(
      3,
      260,
      1,
      60,
      28,
      7,
      colors[8],
      "Images/neptune.bmp"
    );
    // neptune.setOrbitPath(50, 100)
    this.sun.attachMoon(neptune);
  }

  // Initialize a planet
  initializePlanet(
    scale,
    dayPeriod,
    yearPeriod,
    orbitDistance,
    axisTilt,
    orbitTilt,
    color,
    texture
  ) {
    return new Planet(
      this.gl,
      this.program,
      scale,
      dayPeriod,
      yearPeriod,
      orbitDistance,
      axisTilt,
      orbitTilt,
      color,
      texture
    );
  }

  // Initialize the ship
  initShip() {
    this.ship = new Ship(this.gl, this.program, vec3(20, 10, -30), 0);
  }

  // Initialize the animation
  initAnimation() {
    this.animate = false;
    document
      .getElementById("play-pause-button")
      .addEventListener("click", () => this.animateButtonClicked());
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  // Toggle the animation
  animateButtonClicked() {
    this.animate = !this.animate;
    document.getElementById("play-pause-button").innerText = this.animate
      ? "Pause"
      : "Play";
  }

  initViewSwitch() {
    this.viewMode = 0; // 0: split view, 1: ship view, 2: map view
    document
      .getElementById("switch-views-button")
      .addEventListener("click", () => this.switchViewMode());
  }

  switchViewMode() {
    this.viewMode = (this.viewMode + 1) % 3;
  }

  // Handle key down events
  handleKeyDown(event) {
    switch (event.key) {
      case "z": // Move forward
        this.ship.moveForward(-1);
        break;
      case "x": // Move backward
        this.ship.moveForward(1);
        break;
      case "a": // Move left
        this.ship.moveSideways(1);
        break;
      case "d": // Move right
        this.ship.moveSideways(-1);
        break;
      case "q": // Rotate CCW
        this.ship.rotate(-5);
        break;
      case "e": // Rotate CW
        this.ship.rotate(5);
        break;
      case "w": // Move up
        this.ship.moveUp(1);
        break;
      case "s": // Move down
        this.ship.moveUp(-1);
        break;
    }
  }

  //update the scene
  update() {
    // Clear the color and depth buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const viewportWidth = this.canvas.width;
    const viewportHeight = this.canvas.height / 2;

    // Set up projection matrix for top view
    const topViewProjectionMat = ortho(-150.0, 150.0, -65.0, 65.0, -75.0, 75.0);

    // Set up view and model matrices
    const eyeTop = vec3(0.0, 10.0, 0.0);
    const atTop = vec3(0.0, 0.0, 0.0);
    const upTop = vec3(0.0, 0.0, 1.0);
    const viewMatTop = lookAt(eyeTop, atTop, upTop);
    const modelMat = mat4();

    // Set up projection matrix and view matrix for ship's view
    const shipViewProjectionMat = perspective(90, 1, 0.1, 100);
    const viewMatShip = this.ship.getViewMatrix();

    // Update planet positions if animation is enabled
    if (this.animate) {
      this.sun.update();
    }

    switch (this.viewMode) {
      case 0: // Split view
        // Top-down view
        this.gl.viewport(0, 0, viewportWidth, viewportHeight);
        this.sun.render(topViewProjectionMat, viewMatTop, modelMat);
        this.ship.render(topViewProjectionMat, viewMatTop, modelMat);

        // Ship's view
        this.gl.viewport(0, viewportHeight, viewportWidth, viewportHeight);
        this.sun.render(shipViewProjectionMat, viewMatShip, modelMat);
        this.ship.render(shipViewProjectionMat, viewMatShip, modelMat);
        break;
      case 1: // Ship view only
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.sun.render(shipViewProjectionMat, viewMatShip, modelMat);
        this.ship.render(shipViewProjectionMat, viewMatShip, modelMat);
        break;
      case 2: // Map view only
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.sun.render(topViewProjectionMat, viewMatTop, modelMat);
        this.ship.render(topViewProjectionMat, viewMatTop, modelMat);
        break;
    }
  }

  // Render the scene
  render() {
    this.update();
    requestAnimationFrame(() => this.render());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Solar();
});
