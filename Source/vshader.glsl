attribute vec4 vPosition;
attribute vec3 vNormal;
attribute vec2 vTexCoord;
varying vec4 vColor; // Pass the calculated color to the fragment shader
varying vec2 fTexCoord; // Pass the texture coordinates to the fragment shader

uniform mat4 projectionMat;
uniform mat4 viewMat;
uniform mat4 modelMat;

uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 materialColor;
uniform int isEmissive; // New uniform to indicate emissive material

void main() 
{
    vec3 transformedNormal = normalize(mat3(modelMat) * vNormal); // Transform the normal to world space
    vec4 transformedPosition = modelMat * vPosition; // Transform the position to world space

    // Calculate ambient component
    vec3 ambient = ambientColor * materialColor;

    if (isEmissive == 1) {
        // Emissive color
        vColor = vec4(materialColor + ambient, 1.0); // Add ambient light to emissive color
    } else {
        // Calculate the light direction
        vec3 lightDir = normalize(lightPosition - vec3(transformedPosition));

        // Calculate the diffuse component
        float diff = max(dot(transformedNormal, lightDir), 0.0);
        vec3 diffuse = diff * lightColor * materialColor;

        // Combine the ambient and diffuse components
        vec3 color = ambient + diffuse;

        // Pass the calculated color to the fragment shader
        vColor = vec4(color, 1.0);
    }

    // Pass the texture coordinates to the fragment shader
    fTexCoord = vTexCoord;

    // Calculate the final position
    gl_Position = projectionMat * viewMat * transformedPosition;
}
