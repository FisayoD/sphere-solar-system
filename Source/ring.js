// ring.js
// Sphere Solar System
// Authors: Juan Malaver, Fisayo Ojo, 2024

"use strict";

// The Ring class that defines and draws a ring
class Ring {
  constructor(
    gl,
    shaderProgram,
    innerRadius,
    outerRadius,
    numSegments = 100,
    tiltAngle = 0
  ) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numSegments = numSegments; // Number of segments to approximate the ring
    this.tiltAngle = tiltAngle;

    // Create a Vertex Array Object
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Initialize the ring data
    this.generateRingData();

    var floatBytes = 4; // number of bytes in a float value

    // Create and load the vertex positions
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );
    this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);

    // Create and load the vertex normals
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    this.vNormal = gl.getAttribLocation(this.shaderProgram, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 6 * floatBytes, 3 * floatBytes);
    gl.enableVertexAttribArray(this.vNormal);


    // Get uniform variable location for transform matrices
    this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
    this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
    this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");
    this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    this.lightColor = gl.getUniformLocation(shaderProgram, "lightColor");
    this.ambientColor = gl.getUniformLocation(shaderProgram, "ambientColor");
    this.materialColor = gl.getUniformLocation(shaderProgram, "materialColor");

    gl.bindVertexArray(null); // un-bind our vao
  }

  // Generate Ring Data
  generateRingData() {
    const vertices = [];
    const normals = [];
    const thetaStep = (2 * Math.PI) / this.numSegments; // Angle step per segment

    for (let i = 0; i <= this.numSegments; i++) {
      const theta = i * thetaStep; // Current angle
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const xOuter = cosTheta * this.outerRadius;
      const yOuter = sinTheta * this.outerRadius;
      const zOuter = 0;

      const xInner = cosTheta * this.innerRadius;
      const yInner = sinTheta * this.innerRadius;
      const zInner = 0;

      // Add vertices for the outer and inner edges of the ring
      vertices.push(xOuter, yOuter, zOuter);
      vertices.push(xInner, yInner, zInner);

      // Add normals for the outer and inner edges of the ring
      const normal = [0, 1, 0]; 
      normals.push(...normal);
      normals.push(...normal);
    }

    this.vertices = vertices;
    this.normals = normals;
  }

  // Render function that draws the ring
  render(
    projectionMat,
    viewMat,
    modelMat,
    lightPos,
    lightCol,
    ambientCol,
    materialCol
  ) {
    var gl = this.gl;

    // Apply tilt transformation to the model matrix
    const tiltMat = rotate(this.tiltAngle, [1, 0, 0]); // Rotate around x-axis
    modelMat = mult(modelMat, tiltMat);

    // Set up buffer bindings and vertex attributes
    gl.bindVertexArray(this.vao);

    // Set transformation matrices for shader
    gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
    gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.modelMat, false, flatten(modelMat));

    // Set lighting uniforms

    gl.uniform3fv(this.lightPosition, flatten(lightPos));
    gl.uniform3fv(this.lightColor, flatten(lightCol));
    gl.uniform3fv(this.ambientColor, flatten(ambientCol));
    gl.uniform3fv(this.materialColor, flatten(materialCol));

    // Draw the ring using TRIANGLE_STRIP
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length / 3);

    gl.bindVertexArray(null); // un-bind our vao
  }
}
