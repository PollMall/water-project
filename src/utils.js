import vsSource from './shaders/vertex.glsl';
import fsSource from './shaders/fragment.glsl';

export default class Utils {

  static toRadians(degrees) {
    return (degrees * 2.0 * Math.PI) / 360.0
  }

  static createVertexShader(gl) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    
    gl.shaderSource(vertexShader, vsSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert('vertex compilation failed: ' + gl.getShaderInfoLog(vertexShader));
      gl.deleteShader(vertexShader);
      return null;
    }

    return vertexShader
  }

  static createFragmentShader(gl) {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert('fragment compilation failed: ' + gl.getShaderInfoLog(fragmentShader));
      gl.deleteShader(fragmentShader);
      return null;
    }

    return fragmentShader
  }

  static createShaderProgram(gl) {

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, Utils.createVertexShader(gl));
    gl.attachShader(shaderProgram, Utils.createFragmentShader(gl));
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to link the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }
}