// attribute vec3 coordinates;
// void main(void) {
//     gl_Position = vec4(coordinates, 1.0);
// }

precision mediump float;
attribute vec2 position;
uniform float time;
uniform mat4 transformMatrix;
uniform mat4 perspectiveMatrix;
varying vec2 texcoords;

void main() {
  float oscillation = 0.0;
  float amplitude = 0.03;
  float frequence = 18.0;
  float angle = (time + position.x) * frequence;

  oscillation +=  sin(angle) * amplitude;

  texcoords = (position.xy + 1.0) / 2.0;
  gl_Position = perspectiveMatrix * transformMatrix * vec4(position, oscillation, 1.0);
}