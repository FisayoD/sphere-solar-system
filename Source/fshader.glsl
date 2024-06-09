precision mediump float;

varying vec4 vColor;
varying vec2 fTexCoord; // Receive the texture coordinates from the vertex shader

uniform sampler2D texture; // The texture uniform

void main() 
{
    // Get the texture color
    vec4 texColor = texture2D(texture, fTexCoord);

    // Set the final fragment color
    gl_FragColor = vColor * texColor;
}
