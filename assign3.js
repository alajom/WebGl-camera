
"use strict";

var gl;

var pSphere;
var index = 0;
var points = [];
var va = vec4( 0.0, 0.0,-1.0, 1);
var vb = vec4( 0.0, 0.9, 0.3, 1);
var vc = vec4(-0.8,-0.5, 0.3, 1);
var vd = vec4( 0.8,-0.5, 0.3, 1);

var colors = []; //holds color value
var cColor, cColorInner;
var pCube, pCubeInner;
var numVertices = 36;

//Colors
var cubeColor = vec4(1,0,0,1);//red
var cubeColorInner = vec4(1,1,0,1);//yellow
var black = vec4(0,0,0,1);

var  fovY = 45.0;  
var  aspect = 1.0;  
var near = 0.3;
var far = 20.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var thetaVal = [0,0,0];

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrixLocInner, projectionMatrixLocInner;
var SphereModelViewMatrixLoc, SphereProjectionMatrixLoc;
var cam;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var locSphere, locCube;

var dr = 5.0 * Math.PI/180.0;

window.onload = function init() {
    //Setup WebGL
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert ("WebGL isn't available");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.enable(gl.DEPTH_TEST);
    
    //Initialize Shaders
    pSphere = initShaders(gl, "sphereVertex", "sphereColor");
	pCube = initShaders(gl, "cubeVertex", "cubeColor");
	pCubeInner = initShaders(gl, "cubeVertexInner", "cubeColorInner");
    
    //Create sphere and cubes
    gl.useProgram(pSphere);
    sphere(va, vb, vc, vd, 4);
	gl.useProgram(pCube);
	cube(); 
	gl.useProgram(pCubeInner);
	cube();

    
    //Vertex Buffer and Color Buffer code
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosS = gl.getAttribLocation(pSphere, "vPosition");
    gl.vertexAttribPointer(vPosS, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosS);
	
	var vPosC = gl.getAttribLocation(pCube, "vPosition"); 
    gl.vertexAttribPointer(vPosC, 4, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(vPosC); 
	
	var vPosCInner = gl.getAttribLocation(pCubeInner, "vPosition"); 
    gl.vertexAttribPointer(vPosCInner, 4, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(vPosCInner); 
	
	modelViewMatrixLoc = gl.getUniformLocation( pCube, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( pCube, "projectionMatrix" );
	
	modelViewMatrixLocInner = gl.getUniformLocation( pCubeInner, "modelViewMatrix" );
    projectionMatrixLocInner = gl.getUniformLocation( pCubeInner, "projectionMatrix" );
	
	SphereModelViewMatrixLoc = gl.getUniformLocation( pSphere, "modelViewMatrix" );
    SphereProjectionMatrixLoc = gl.getUniformLocation( pSphere, "projectionMatrix" );

	var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var vColS = gl.getAttribLocation(pSphere, "vColor");
    gl.vertexAttribPointer(vColS, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColS);
	
	cColor = gl.getUniformLocation(pCube, "fColor");
	cColorInner = gl.getUniformLocation(pCubeInner, "fColor");

	document.addEventListener("keydown", onDocumentKeyDown, false);
    
    render();
}
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//perspective
    cam = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		
    modelViewMatrix = lookAt(cam, at , up);	
    projectionMatrix = perspective(fovY, aspect, near, far);
	
	//Shows the outter cube
	gl.useProgram(pCube);
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	gl.uniform4fv(cColor, flatten(cubeColor));
	gl.drawArrays(gl.TRIANGLES, index, numVertices);
	gl.uniform4fv(cColor, flatten(black));
	gl.drawArrays(gl.LINE_LOOP, index, numVertices);
	
	//Inner cube
	if(near >= 3){
		gl.useProgram(pCubeInner);
		gl.uniformMatrix4fv( modelViewMatrixLocInner, false, flatten(modelViewMatrix) );
		gl.uniformMatrix4fv( projectionMatrixLocInner, false, flatten(projectionMatrix) );
	
		gl.uniform4fv(cColorInner, flatten(cubeColorInner));
		gl.drawArrays(gl.TRIANGLES, index, numVertices);
		gl.uniform4fv(cColorInner, flatten(black));
		gl.drawArrays(gl.LINE_LOOP, index, numVertices);
	}
	
	//Sphere
	if(near >= 3){
		gl.useProgram(pSphere);
		gl.uniformMatrix4fv( SphereModelViewMatrixLoc, false, flatten(modelViewMatrix) );
		gl.uniformMatrix4fv( SphereProjectionMatrixLoc, false, flatten(projectionMatrix) );
		for (var i = 0; i < index; i += 3) gl.drawArrays(gl.TRIANGLES, i, 3);
	}

    requestAnimFrame(render);
}

//Cube
function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-1,-1, 1, 1),
        vec4(-1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1,-1, 1, 1),
        vec4(-1,-1,-1, 1),
        vec4(-1, 1,-1, 1),
        vec4( 1, 1,-1, 1),
        vec4( 1,-1,-1, 1)];
		
    var indices = [a, b, c, a, c, d];
    
    for (var i = 0; i < indices.length; i++) {
        points.push(vertices[indices[i]]);
    }
}

//Sphere
function sphere(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function onDocumentKeyDown(event){ 
// When key pressed it does stuff
    var keyCode = event.which; 
	//"W"
    if(keyCode == 87){ 
		if (fovY > 20){
			fovY -= 1;
			cubeColor = vec4(1,0,0,1);//red
		} else if (fovY <= 20){
			fovY -= 1;
			cubeColor = vec4(1,1,0,1); //yellow
		}
		
		if(near <= 3.75){
			near += .25;
		}
	//S	
	}else if(keyCode == 83){
		if (fovY > 20){
			fovY += 1;
			cubeColor = vec4(1,0,0,1);
		}else if (fovY <= 20){
			fovY += 1;
			cubeColor = vec4(1,1,0,1); 
		}
		
		if(near >= .25){
			near -= .25;
		}
	//"A"
    }else if(keyCode == 65){
		theta -= dr;
	//"D"
    }else if(keyCode == 68){
		theta += dr;
    } else {
		//Do nothing
	}
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
        
        divideTriangle(a, ab, ac, count-1);
        divideTriangle(ab, b, bc, count-1);
        divideTriangle(bc, c, ac, count-1);
        divideTriangle(ab, bc, ac, count-1);
    } else {
        triangle(a, b, c);
    }
}
function triangle(a, b, c) {
     points.push(a);
     points.push(b);
     points.push(c);
     
     index += 3;
	 
	 var clr = vec4(0, 0, 0.15 + Math.random() * 0.85, 1);
	 
	 colors.push(clr);
	 colors.push(clr);
	 colors.push(clr);
	 
}