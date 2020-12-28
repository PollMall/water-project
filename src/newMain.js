//import-uri
import UtilsCube from './utilsCube.js';
import UtilsWater from './utilsWater.js';
import Cube from './cube.js';
import waterTexture from './water_texture.png';
import { mat4 } from 'gl-matrix';

//declarari
var gl
var renderingProgram
var renderingProgramWater
var canvas

var VBO_cube
var pMat, mvMat, mMat, vMat

var cameraX, cameraY, cameraZ
var fieldOfView, aspect, zNear, zFar

var myCube

var positionLocWater
var textureLoc
var timeLoc
var transformMatLoc
var perspectiveMatLoc
var transformMatrix
var perspectiveMatrix

var vertices
var VERTICES_COUNT
var positionBuffer

var image

//functii
function main() {
    canvas = document.querySelector("#glcanvas");

    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Inițializare WebGL eșuată.");
        return;
    }

    init();
    display();
    initWater();
    displayWater();
}

function init() {
    renderingProgram = UtilsCube.createShaderProgram(gl); // asamblează shader-ul
    gl.useProgram(renderingProgram); // încarcă programul de shading
    setupVertices();
    setupCamera();
}

function initWater() {
    renderingProgramWater = UtilsWater.createShaderProgram(gl); // asamblează shader-ul
    gl.useProgram(renderingProgramWater); // încarcă programul de shading
    setupVerticesWater();
}

function setupVertices() {
    //cube
    myCube = new Cube()
    VBO_cube = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO_cube)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(myCube.vertexPositions_TRIANGLE), gl.STATIC_DRAW)
}

function setupVerticesWater() {
    //water

    // Pass data to the shader program.
    vertices = generateVertices(100);
    VERTICES_COUNT = vertices.length * 0.5;
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocWater, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocWater);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // Cleaning up the buffer.
}

function setupCamera() {
    cameraX = 0.0;
    cameraY = 0.0;
    cameraZ = 8.0;
  
    fieldOfView = UtilsCube.toRadians(90)  // în radiani
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    zNear = 0.1
    zFar = 100.0
}

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

function resizeCanvasToDisplaySize(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

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

function createImage(){
    image = new Image();
    image.crossOrigin = "";
    image.src = waterTexture;
    image.onload = function () {
        const texture = createTexture(gl);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(textureLoc, 0);

        requestAnimationFrame(displayWater);
    };
}

function display() {

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
  
    // Construiește matricea de perspectivă
    pMat = mat4.create()
    mat4.perspective(pMat, fieldOfView, aspect, zNear, zFar)
  
    // construiește matricea de view
    vMat = mat4.create()
    mat4.translate(vMat, vMat, [-cameraX, -cameraY, -cameraZ])
  
    // --------- CUB
  
    // matricea de model construită dintr-o matrice de translație, tMat, și una de rotație, rMat
    mMat = mat4.create()
    mat4.translate(mMat, mMat, myCube.location)
    mat4.rotate(mMat, mMat, UtilsCube.toRadians(45), [0, 1, 0]);
  
    // matricea de model-view
    mvMat = mat4.create()
    mat4.multiply(mvMat, vMat, mMat)
  
    // copiază matricea de poziționare a cubului în variabila uniformă corespunzătoare 
    const pMatLoc = gl.getUniformLocation(renderingProgram, 'proj_matrix')
    gl.uniformMatrix4fv(pMatLoc, false, pMat)
  
    // copiază matricea de poziționare a cubului în variabila uniformă corespunzătoare 
    var mvMatLoc = gl.getUniformLocation(renderingProgram, 'mv_matrix')
    gl.uniformMatrix4fv(mvMatLoc, false, mvMat)
  
  
    // transmite vârfurile cubului
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO_cube)
    var positionLoc = gl.getAttribLocation(renderingProgram, 'position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)
  
    gl.drawArrays(gl.TRIANGLES, 0, 24)
    requestAnimationFrame(display)
}

function displayWater(time) {
    createImage();

    resizeCanvasToDisplaySize(canvas)
    gl.uniform1f(timeLoc, time * 0.001);

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
  
    // --------- WATER

    // Shaders variables locations.
    positionLocWater = gl.getAttribLocation(renderingProgramWater, "position");
    textureLoc = gl.getUniformLocation(renderingProgramWater, "texture");
    timeLoc = gl.getUniformLocation(renderingProgramWater, "time");
    transformMatLoc = gl.getUniformLocation(renderingProgramWater, "transformMatrix");
    perspectiveMatLoc = gl.getUniformLocation(renderingProgramWater, "perspectiveMatrix");

    transformMatrix = mat4.create();
    perspectiveMatrix = mat4.create();

    mat4.translate(transformMatrix, transformMatrix, [0, -0.5, -1.5]);
    mat4.rotate(transformMatrix, transformMatrix, 1.22, [-1, 0, 0]);
    mat4.scale(transformMatrix, transformMatrix, [2.8, 1, 1]);
    gl.uniformMatrix4fv(transformMatLoc, false, transformMatrix);

    mat4.perspective(perspectiveMatrix, 1, canvas.width / canvas.height, 1, 1000);
    gl.uniformMatrix4fv(perspectiveMatLoc, false, perspectiveMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, VERTICES_COUNT);
    // ...
  
    requestAnimationFrame(displayWater)
}

main();