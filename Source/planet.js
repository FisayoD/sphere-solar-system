// planet.js
// Sphere Solar System
// Authors: Juan Malaver, Fisayo Ojo, 2024

// planet.js
"use strict";

class Planet {
    constructor(
      gl,
      program,
      scale,
      dayPeriod,
      yearPeriod,
      orbitDistance,
      axisTilt,
      orbitTilt,
      colors,
      textureSrc,
      isEmissive = false
    ) {
      // Initialize the WebGL context, program, and planet properties
      this.gl = gl;
      this.program = program;
      this.scale = scale;
      this.dayPeriod = dayPeriod;
      this.yearPeriod = yearPeriod;
      this.orbitDistance = orbitDistance;
      this.axisTilt = axisTilt;
      this.orbitTilt = orbitTilt;
      this.colors = colors;
      this.isEmissive = isEmissive;
      
      this.texture = null; // Initialize texture
  
      // Initialize rotation angles and update rate
      this.dayRotation = 0;
      this.yearRotation = 0;
      this.updateRate = 200;
  
      // Initialize the UV sphere data
      this.generateSphereData();
  
      // Create and bind the vertex array object
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
  
      this.orbitPathsVisible = true;
      document
        .getElementById("toggleOrbitPaths")
        .addEventListener("click", () => {
          this.orbitPathsVisible = !this.orbitPathsVisible;
        });
  
      // Create and bind the vertex buffer
      this.planetBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.planetBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
  
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
  
      this.textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(this.textureCoords), gl.STATIC_DRAW);
  
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  
      // Define the attribute locations
      this.defineAttributeLocations();
  
      // Define the uniform locations
      this.defineUniformLocations();
  
      // Unbind the vertex array object
      gl.bindVertexArray(null);
  
      // Array to store moon objects
      this.moons = [];
  
      // Ring and orbit path objects
      this.ring = null;
      this.orbitPaths = [];
  
      // Load the texture
      this.loadTexture(textureSrc);
    }
  
    // Generate the UV sphere data
    generateSphereData() {
      const latitudeBands = 100;
      const longitudeBands = 100;
      const radius = this.scale * 0.5;
  
      const vertices = [];
      const normals = [];
      const indices = [];
      const textureCoords = [];
  
      for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = (latNumber * Math.PI) / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
  
        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
          const phi = (longNumber * 2 * Math.PI) / longitudeBands;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);
  
          const x = cosPhi * sinTheta;
          const y = cosTheta;
          const z = sinPhi * sinTheta;
  
          normals.push(x, y, z);
          vertices.push(radius * x, radius * y, radius * z);
          textureCoords.push(longNumber / longitudeBands, latNumber / latitudeBands);
        }
      }
  
      for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
          const first = latNumber * (longitudeBands + 1) + longNumber;
          const second = first + longitudeBands + 1;
          indices.push(first, second, first + 1);
          indices.push(second, second + 1, first + 1);
        }
      }
  
      this.vertices = vertices;
      this.normals = normals;
      this.indices = indices;
      this.textureCoords = textureCoords;
    }
  
    loadTexture(textureSrc) {
      const texture = this.gl.createTexture();
      const image = new Image();
      image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      };
      // console.log(textureSrc);
      image.src = textureSrc;
      this.texture = texture;
    }
  
    defineAttributeLocations() {
      this.gl.bindVertexArray(this.vao);
      this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.planetBuffer);
      this.gl.vertexAttribPointer(this.vPosition, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.vPosition);
  
      this.vNormal = this.gl.getAttribLocation(this.program, "vNormal");
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
      this.gl.vertexAttribPointer(this.vNormal, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.vNormal);
  
      this.vTexCoord = this.gl.getAttribLocation(this.program, "vTexCoord");
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
      this.gl.vertexAttribPointer(this.vTexCoord, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.vTexCoord);
    }
  
    defineUniformLocations() {
      this.projectionMat = this.gl.getUniformLocation(this.program, "projectionMat");
      this.viewMat = this.gl.getUniformLocation(this.program, "viewMat");
      this.modelMat = this.gl.getUniformLocation(this.program, "modelMat");
      this.lightPosition = this.gl.getUniformLocation(this.program, "lightPosition");
      this.lightColor = this.gl.getUniformLocation(this.program, "lightColor");
      this.ambientColor = this.gl.getUniformLocation(this.program, "ambientColor");
      this.materialColor = this.gl.getUniformLocation(this.program, "materialColor");
    }
  
    attachMoon(moon) {
      this.moons.push(moon);
      this.initOrbitPath();
    }
  
    attachRing(innerRadius, outerRadius, numSegments = 100, tiltAngle = 0) {
      this.ring = new Ring(this.gl, this.program, innerRadius, outerRadius, numSegments);
    }
  
    initOrbitPath() {
      let orbitPaths = [];
      for (let i = 0; i < this.moons.length; i++) {
        let moon = this.moons[i];
        let orbitPath = new Ring(this.gl, this.program, moon.orbitDistance - 0.05, moon.orbitDistance + 0.05, 1000);
        orbitPaths.push(orbitPath);
      }
      this.orbitPaths = orbitPaths;
    }
  
    update() {
      const timeElapsed = 1000;
      const dayRotationSpeed = (360.0 / timeElapsed) * (this.dayPeriod / this.updateRate);
      const yearRotationSpeed = (360.0 / timeElapsed) * (this.yearPeriod / this.updateRate);
  
      this.dayRotation += dayRotationSpeed;
      this.dayRotation %= 360;
  
      this.yearRotation += yearRotationSpeed;
      this.yearRotation %= 360;
  
      this.moons.forEach((moon) => moon.update());
    }
  
    render(projectionMat, viewMat, modelMat, parentPosition = vec3(0, 0, 0)) {
      this.gl.bindVertexArray(this.vao);
  
      const axisTiltMat = rotate(this.axisTilt, [1, 0, 0]);
      const dayRotationMat = rotate(this.dayRotation, [0, 1, 0]);
      modelMat = mult(modelMat, mult(axisTiltMat, dayRotationMat));
  
      this.gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
      this.gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
      this.gl.uniformMatrix4fv(this.modelMat, false, flatten(modelMat));
  
      const lightPos = vec3(0.0, 0.0, 0.0);
      const lightCol = vec3(1.0, 1.0, 1.0);
      const ambientCol = vec3(0.2, 0.2, 0.2);
    //   const materialCol = this.colors;
  
      this.gl.uniform3fv(this.lightPosition, flatten(lightPos));
      this.gl.uniform3fv(this.lightColor, flatten(lightCol));
      this.gl.uniform3fv(this.ambientColor, flatten(ambientCol));
    //   this.gl.uniform3fv(this.materialColor, flatten(materialCol));
  
      if (this.isEmissive) {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 1);
      } else {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 0);
      }
  
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.uniform1i(this.gl.getUniformLocation(this.program, "texture"), 0);
  
      this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
  
      if (this.ring) {
        let ringModelMat = modelMat;
        ringModelMat = mult(ringModelMat, rotate(90, [1, 0, 0]));
        ringModelMat = mult(ringModelMat, rotate(90, [0, 0, 1]));
  
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 1);
        this.ring.render(projectionMat, viewMat, ringModelMat, lightPos, lightCol, vec3(0.7, 0.7, 0.7), vec3(0.8, 0.8, 0.8));
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 0);
      }
  
      this.orbitPaths.forEach((orbitPath, index) => {
        let orbitModelMat = modelMat;
  
        orbitModelMat = mult(orbitModelMat, rotate(this.moons[index].orbitTilt, [0, 0, 1]));
        orbitModelMat = mult(orbitModelMat, rotate(90, [1, 0, 0]));
        if (this.orbitPathsVisible) {
          this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 1);
          orbitPath.render(projectionMat, viewMat, orbitModelMat, lightPos, lightCol, vec3(0.7, 0.7, 0.7), vec3(0.8, 0.8, 0.8));
          this.gl.uniform1i(this.gl.getUniformLocation(this.program, "isEmissive"), 0);
        }
      });
  
      this.moons.forEach((moon) => {
        const moonX = moon.orbitDistance * Math.cos(radians(moon.yearRotation));
        const moonZ = moon.orbitDistance * Math.sin(radians(moon.yearRotation));
        const moonPosition = vec4(moonX, 0, moonZ, 1);
  
        const orbitTiltMat = rotate(moon.orbitTilt, [0, 0, 1]);
        const moonRotationMat = rotate(moon.yearRotation, [0, 1, 0]);
        const transformedMoonPosition = vec3(...mult(orbitTiltMat, moonPosition));
  
        const moonModelMat = mult(modelMat, translate(transformedMoonPosition));
  
        moon.render(projectionMat, viewMat, moonModelMat, transformedMoonPosition);
      });
  
      this.gl.bindVertexArray(null);
    }
  
  }
  