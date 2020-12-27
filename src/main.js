import Utils from './utils.js';
import vShaderSrc from './shaders/vertex.glsl';
import fShaderSrc from './shaders/fragment.glsl';
import { mat4 } from 'gl-matrix';
import waterTexture from './water_texture.png';

const canvas = getCanvasElement();
const gl = getWebGLContext(canvas);

// Create Program & Load shaders.
const program = createProgram(gl, vShaderSrc, fShaderSrc);

// Tell to WebGL to use our program (pair of shaders)
gl.useProgram(program);

/*
 * INITIALIZATION.
 */
// Shaders variables locations.
const positionLoc = gl.getAttribLocation(program, "position");
const textureLoc = gl.getUniformLocation(program, "texture");
const timeLoc = gl.getUniformLocation(program, "time");
const transformMatLoc = gl.getUniformLocation(program, "transformMatrix");
const perspectiveMatLoc = gl.getUniformLocation(program, "perspectiveMatrix");

// Pass data to the shader program.
const vertices = generateVertices(100);
const VERTICES_COUNT = vertices.length * 0.5;
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, null); // Cleaning up the buffer.

// Matrix stuffs.
const transformMatrix = mat4.create();
const perspectiveMatrix = mat4.create();

mat4.translate(transformMatrix, transformMatrix, [0, -0.5, -1.5]);
mat4.rotate(transformMatrix, transformMatrix, 1.22, [-1,0,0]);
mat4.scale(transformMatrix, transformMatrix, [2.8, 1, 1]);
gl.uniformMatrix4fv(transformMatLoc, false, transformMatrix);

/*
 * RENDERING.
 */
function render(time) {
  resizeCanvasToDisplaySize(canvas);

  gl.uniform1f(timeLoc, time * 0.001);

  mat4.perspective(perspectiveMatrix, 1, canvas.width / canvas.height, 1, 1000);
  gl.uniformMatrix4fv(perspectiveMatLoc, false, perspectiveMatrix);

  // Clear the canvas.
  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // finally draw the result to the canvas.
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, VERTICES_COUNT);
  requestAnimationFrame(render);
}

const image = new Image();
image.crossOrigin = "";
image.src = waterTexture;

image.onload = function () {
  const texture = createTexture(gl);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(textureLoc, 0);

  requestAnimationFrame(render);
};

function generateVertices(indicesNum) {
  let vertices = [];
  const limit = Math.ceil(indicesNum / 4) - 4;
//   const limit = indicesNum;

  for (let i = limit; i > 0; i--) {
    let j = (-1 * i) / limit;
    vertices.push(j);
    vertices.push(1.0);
    vertices.push(j);
    vertices.push(-1.0);
  }

  vertices.push(0.0);
  vertices.push(1.0);
  vertices.push(0.0);
  vertices.push(-1.0);

  for (let k = 1; k <= limit; k++) {
    let l = k / limit;
    vertices.push(l);
    vertices.push(1.0);
    vertices.push(l);
    vertices.push(-1.0);
  }

  return vertices;
}

/**
 * Retrieve the Canvas to use.
 *
 * @return {HTMLCanvasElement} A canvas element on the DOM.
 */
function getCanvasElement() {
  var canvas = document.createElement("canvas");
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
  canvas.id = "gl";

  document.body.appendChild(canvas);
  return canvas;
}

/**
 * Resize a canvas to match the size its displayed.
 *
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 */
function resizeCanvasToDisplaySize(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Returns the WebGL Rendering Context from the canvas.
 *
 * @param {HTMLCanvasElement} canvas The Canvas element to use.
 *
 * @return {WebGLRenderingContext} The WebGLRenderingContext to use.
 */
function getWebGLContext(canvas) {
  var gl = null;

  if (canvas == null) {
    console.error("There is no canvas on this page");
    return;
  }

  var contextNames = ["webgl", "experimental-webgl"];
  for (let i = 0; i < contextNames.length; i++) {
    try {
      gl = canvas.getContext(contextNames[i]);
    } catch (e) {}
    if (gl) break;
  }

  if (gl == null) {
    console.error("WebGL is not available.");
    return;
  }

  return gl;
}

/**
 * Creates and compiles a shader.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 *
 * @return {WebGLShader} The created shader.
 */
function compileShader(gl, shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var lastError = gl.getShaderInfoLog(shader);
    console.error("Error compiling shader '" + shader + "':" + lastError);

    // Something went wrong during compilation; get the error
    gl.deleteShader(shader);
    return;
  }

  return shader;
}

/**
 * Creates a program, compiles and attaches shaders.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} vShaderSource The vertex shader.
 * @param {string} fShaderSource The fragment shader.
 *
 * @return {WebGLProgram} a WebGL program.
 */
function createProgram(gl, vShaderSource, fShaderSource) {
  var program = gl.createProgram();

  // Compile shaders.
  var vertexShader = compileShader(gl, vShaderSource, gl.VERTEX_SHADER);
  var fragmentShader = compileShader(gl, fShaderSource, gl.FRAGMENT_SHADER);

  // Attach shaders to the program.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program to the GPU.
  gl.linkProgram(program);

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var lastError = gl.getProgramInfoLog(program);
    console.error("Error in program linking:" + lastError);

    // something went wrong with the link
    gl.deleteProgram(program);
    return;
  }

  return program;
}

/**
 * Creates a texture.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 *
 * @return {WebGLTexture} The created texture.
 */
function createTexture(gl) {
  var texture = gl.createTexture();
  // Set properties for the texture.
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // These properties let you upload textures of any sizes.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // These determine how interpolation is made if the image is being scaled up or down.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Clean up buffer.
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}
