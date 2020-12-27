// void main(void) {
//     gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0);
// }

precision mediump float;
varying vec2 texcoords;
uniform sampler2D texture;

void main() {
  gl_FragColor = texture2D(texture, texcoords);
}