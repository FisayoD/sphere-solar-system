# COMP 3801 - Computer Graphics
## Sphere Solar System

### Authors
- Juan Malaver
- Fisayo Ojo

### Overview
This project aims to recreate a simplified version of the solar system using WebGL and JavaScript. The focus is on improving the previous assignment submission to now include orbit paths and a ring around saturn. We made use of a ring class and the position of the planets relative to the sun. For the moons they were relative to their respective planets. We also worked on lighting for the planets and made the ship brighter through the altering of the vertice arrangement we had earlier. We also made use of the textures as provided in the canvas and did away with initial color setting from previous assignment submission. The new solar system includes representation of planets(sun, moon and the planets) as textured spheres and depicted their orbital paths as well.

### Instructions
1. Open `index.html` in a web browser that supports WebGL using Live Preview.
2. Press `Play` to begin orbit animation. Press `Pause` to stop animation.
3. Use the keyboard controls to navigate the spaceship camera:
    - Move forward/backward along the viewing direction: `Z` / `X`
    - Move left/right perpendicular to the viewing direction: `A` / `D`
    - Move up/down along the world Y-axis: `W` / `S`
    - Rotate counterclockwise/clockwise around the Y-axis: `Q` / `E`
4. Click the `Switch Viewport` button to switch between the dual view with the ship and map, then ship only and map only respectively.
5. Click the `Orbit Path On/Off` button to toggle the orbit path so it goes from on to off and vice versa.

### File Structure
- `index.html`: HTML page containing the canvas and play/pause button.
- `solar.js`: Class for setting up the solar system, handling animations, key presses, and viewport setup, view port switch, orbit path toggle.
- `planet.js`: Class for rendering individual planets as spheres, including moons, with customizable properties and also other features like the orbit paths.
- `ship.js`: Class for controlling the camera spaceship, including movement and, colors and textures.
- `ring.js`: Class for ring creation, it has properties like the radius and numsegments and we use instances of this class to create the ring around saturn and the orbital paths.

### License
This project is under the MIT license. See `LICENSE` for more details.
