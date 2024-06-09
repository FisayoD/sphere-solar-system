// ship.js
// Sphere Solar System
// Authors: Juan Malaver, Fisayo Ojo, 2024

"use strict";

class Ship {
  constructor(gl, program, position, rotationAngle) {
    this.gl = gl;
    this.program = program;
    this.position = position;
    this.rotationAngle = rotationAngle;

    this.shipVertices = [
      vec3(0, 0, 0),
      vec3(-1, 0, -5),
      vec3(1, 0, -5)
    ];

    this.shipNormals = [
      vec3(0, 1, 0),
      vec3(0, 1, 0),
      vec3(0, 1, 0)
    ];

    this.numVertices = this.shipVertices.length;

    // Create and bind the vertex array object
    this.shipVAO = gl.createVertexArray();
    gl.bindVertexArray(this.shipVAO);

    // Create and bind the vertex buffer
    this.shipBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shipBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.shipVertices), gl.STATIC_DRAW);

    // Create and bind the normal buffer
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.shipNormals), gl.STATIC_DRAW);

    // Define the attribute locations
    this.defineAttributeLocations();
    this.defineUniformLocations();

    gl.bindVertexArray(null);
  }

  // Define the attribute locations
  defineAttributeLocations() {
    const floatBytes = 4;
    const stride = 3 * floatBytes; // 3 for position

    // Define the vertex position
    this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shipBuffer);
    this.gl.vertexAttribPointer(
      this.vPosition,
      3,
      this.gl.FLOAT,
      false,
      stride,
      0
    );
    this.gl.enableVertexAttribArray(this.vPosition);

    // Define the vertex normal
    this.vNormal = this.gl.getAttribLocation(this.program, "vNormal");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(this.vNormal, 3, this.gl.FLOAT, false, stride, 0);
    this.gl.enableVertexAttribArray(this.vNormal);
  }

  // Define the uniform locations
  defineUniformLocations() {
    this.projectionMat = this.gl.getUniformLocation(
      this.program,
      "projectionMat"
    );
    this.viewMat = this.gl.getUniformLocation(this.program, "viewMat");
    this.modelMat = this.gl.getUniformLocation(this.program, "modelMat");
    this.lightPosition = this.gl.getUniformLocation(
      this.program,
      "lightPosition"
    );
    this.lightColor = this.gl.getUniformLocation(this.program, "lightColor");
    this.ambientColor = this.gl.getUniformLocation(
      this.program,
      "ambientColor"
    );
    this.materialColor = this.gl.getUniformLocation(
      this.program,
      "materialColor"
    );
  }

  // Move forward
  moveForward(delta) {
    const movementX = delta * Math.sin(this.rotationAngle);
    const movementZ = -delta * Math.cos(this.rotationAngle);
    const movement = vec3(movementX, 0, movementZ);
    this.position = add(this.position, movement);
  }

  // Move sideways
  moveSideways(delta) {
    const movementX = delta * Math.cos(this.rotationAngle);
    const movementZ = delta * Math.sin(this.rotationAngle);
    const movement = vec3(movementX, 0, movementZ);
    this.position = add(this.position, movement);
  }

  // Rotate the ship
  rotate(theta) {
    const angleInRadians = radians(theta);
    this.rotationAngle += angleInRadians;

    // Update ship's vertices based on the rotation
    this.shipVertices[0] = vec3(
      this.shipVertices[0][0] * Math.cos(angleInRadians) -
        this.shipVertices[0][2] * Math.sin(angleInRadians),
      this.shipVertices[0][1],
      this.shipVertices[0][0] * Math.sin(angleInRadians) +
        this.shipVertices[0][2] * Math.cos(angleInRadians)
    );

    this.shipVertices[1] = vec3(
      this.shipVertices[1][0] * Math.cos(angleInRadians) -
        this.shipVertices[1][2] * Math.sin(angleInRadians),
      this.shipVertices[1][1],
      this.shipVertices[1][0] * Math.sin(angleInRadians) +
        this.shipVertices[1][2] * Math.cos(angleInRadians)
    );

    this.shipVertices[2] = vec3(
      this.shipVertices[2][0] * Math.cos(angleInRadians) -
        this.shipVertices[2][2] * Math.sin(angleInRadians),
      this.shipVertices[2][1],
      this.shipVertices[2][0] * Math.sin(angleInRadians) +
        this.shipVertices[2][2] * Math.cos(angleInRadians)
    );

    // Update ship's vertex buffer data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shipBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.shipVertices),
      this.gl.STATIC_DRAW
    );
}


  // Move up
  moveUp(delta) {
    this.position[1] += delta;
  }

  // Get the view matrix
  getViewMatrix() {
    // Calculate the forward vector
    const rotationX = -Math.sin(this.rotationAngle);
    const rotationZ = Math.cos(this.rotationAngle);
    const forwardVector = vec3(rotationX, 0, rotationZ);

    // Calculate the target
    const target = add(this.position, forwardVector);

    return lookAt(this.position, target, vec3(0, 1, 0));
  }

  render(projectionMat, viewMat, modelMat) {
    // Bind the vertex array object
    this.gl.bindVertexArray(this.shipVAO);

    // Update the model matrix
    const rotationMat = rotate(this.rotationAngle, vec3(0, 1, 0));
    const translationMat = translate(this.position);
    modelMat = mult(translationMat, rotationMat);

    // Set the uniform values
    this.gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
    this.gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    this.gl.uniformMatrix4fv(this.modelMat, false, flatten(modelMat));

    // Set light and material properties for solid white color
    const lightPos = vec3(10.0, 10.0, 10.0);
    const lightCol = vec3(1.0, 1.0, 1.0);
    const ambientCol = vec3(1.0, 1.0, 1.0); // Bright ambient light
    const materialCol = vec3(1.0, 1.0, 1.0); // White material color

    this.gl.uniform3fv(this.lightPosition, flatten(lightPos));
    this.gl.uniform3fv(this.lightColor, flatten(lightCol));
    this.gl.uniform3fv(this.ambientColor, flatten(ambientCol));
    this.gl.uniform3fv(this.materialColor, flatten(materialCol));

    // Draw the ship as a solid white triangle
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numVertices);

    // Unbind the vertex array object
    this.gl.bindVertexArray(null);
  }
}
