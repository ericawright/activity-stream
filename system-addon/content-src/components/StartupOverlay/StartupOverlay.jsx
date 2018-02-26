import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import React from "react";
import {vertexShader, fragmentShader, setRectangle, resizeCanvasToDisplaySize} from "./webgl-utils";
// import waves from '../../../data/content/assets/wave1-2048.png';
import waves from "./image-addresses.js";

export class _StartupOverlay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.canvas = null;
  }

  attachGL(canvas) {
    let scene = document.getElementById('scene');
    scene.dataset.content = 'true';

    let gl = canvas.getContext("webgl");
    let program = gl.createProgram();

    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexShader);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      // Something went wrong during compilation; get the error
      console.log('error in vert')
      throw "could not compile shader:" + gl.getShaderInfoLog(vertShader);
    }

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentShader);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      // Something went wrong during compilation; get the error
      throw "could not compile shader:" + gl.getShaderInfoLog(fragShader);
    }

    gl.attachShader(program, fragShader);
    gl.attachShader(program, vertShader); 
    gl.linkProgram(program);
    gl.useProgram(program);

    let positionLocation = gl.getAttribLocation(program, "a_position");
    let texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    resizeCanvasToDisplaySize(gl.canvas);

    // Set a rectangle the same size as the canvas.
    setRectangle(gl, 0, 0, canvas.width, canvas.height);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // provide texture coordinates for the rectangle.
    let texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);

    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    let initialLocation = gl.getUniformLocation(program, "u_coord");
    let scaleBaseLocation = gl.getUniformLocation(program, "u_scale_base");
    let scaleVarienceLocation = gl.getUniformLocation(program, "u_scale_varience");
    let skewVarienceLocation = gl.getUniformLocation(program, "u_skew_varience");
    let translateLocation = gl.getUniformLocation(program, "u_translate");
    let imageLocation = gl.getUniformLocation(program, "u_image");
    let timeLocation = gl.getUniformLocation(program, "u_time");
    let sizeLocation = gl.getUniformLocation(program, "u_size");
    let offsetLocation = gl.getUniformLocation(program, "u_offset");

    //spin uniforms
    let spinTimerLocation = gl.getUniformLocation(program, "u_spin_timer");
    let spinDegreesLocation = gl.getUniformLocation(program, "u_degrees");
    let spinTranslateLocation = gl.getUniformLocation(program, "u_spin_translate");
    let spinFragTimeLocation = gl.getUniformLocation(program, "u_spin_time_frag");

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 2;          // 2 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1i(imageLocation, 0);
    gl.uniform2f(sizeLocation, .275, .275); // Width  and height of each image

    let drawWaves = function (time, movement) {
      gl.uniform2f(offsetLocation, movement.offSetX, movement.offSetY);
      gl.uniform2f(scaleBaseLocation, movement.xScaleBase, movement.yScaleBase);
      gl.uniform2f(scaleVarienceLocation, movement.xScaleVarience, movement.yScaleVarience);
      gl.uniform2f(skewVarienceLocation, movement.xSkewVarience, movement.ySkewVarience);
      gl.uniform2f(initialLocation, movement.initialX, movement.initialY);
      gl.uniform2f(translateLocation, movement.translateX, movement.translateY);
      gl.uniform1f(timeLocation, ((time * movement.speed) + movement.delay) % movement.period);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    let wave1Movement = {
      texture: 0,
      offSetX: 0.05,
      offSetY: 0.01,
      xScaleBase: 1.45,
      yScaleBase: 1.5,
      xScaleVarience: 0.1,
      yScaleVarience: 0.1,
      xSkewVarience: 0.0,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: 0.1,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.0015,
      period: 11,

      spin_delay: -1.0,
      spin_radians: 4.0,
      spin_translateX: 0.9,
      spin_translateY: 1.4,
      spin_speed: 0.002,
    }

    let wave2Movement = {
      texture: 1,
      offSetX: 0.35,
      offSetY: 0.01,
      xScaleBase: 1.4,
      yScaleBase: 1.3,
      xScaleVarience: 0.1,
      yScaleVarience: 0.1,
      xSkewVarience: 0.0,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: -0.3,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.0016,
      period: 11,
      
      spin_delay: -1.0,
      spin_radians: 0.0,
      spin_translateX: 0.1,
      spin_translateY: -0.8,
      spin_speed: 0.0028,
    }

    let wave3Movement = {
      texture: 2,
      offSetX: 0.68,
      offSetY: 0.05,
      xScaleBase: 1.3,
      yScaleBase: 0.6,
      xScaleVarience: 0.2,
      yScaleVarience: 0.0,
      xSkewVarience: 0.3,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: -0.4,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.0011,
      period: 11,
      
      spin_delay: -1.0,
      spin_radians: 2.1,
      spin_translateX: 0.25,
      spin_translateY: 0.25,
      spin_speed: 0.0027,
    }

    let wave4Movement = {
      texture: 3,
      offSetX: 0.05,
      offSetY: 0.38,
      xScaleBase: 1.3,
      yScaleBase: 1.2,
      xScaleVarience: 0.0,
      yScaleVarience: -0.1,
      xSkewVarience: -0.1,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: -0.8,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.00018,
      period: 11,
      zindex: .7,
      
      spin_delay: -1.0,
      spin_radians: 0.5,
      spin_translateX: 0.4,
      spin_translateY: -0.3,
      spin_speed: 0.0026,
    }
    
    let wave5Movement = {
      offSetX: 0.35,
      offSetY: 0.38,
      xScaleBase: 1.7,
      yScaleBase: 0.5,
      xScaleVarience: -0.2,
      yScaleVarience: 0.1,
      xSkewVarience: 0.3,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: 0.15,
      translateX: 0.0,
      translateY: -0.1,
      delay: 4.5,
      speed: 0.0005,
      period: (4 * Math.PI),
      
      spin_delay: -1.0,
      spin_radians: 1.4,
      spin_translateX: 0.8,
      spin_translateY: -0.3,
      spin_speed: 0.0025,
    }
    
    let wave6Movement = {
      texture: 5,
      offSetX: 0.68,
      offSetY: 0.38,
      xScaleBase: 1.5,
      yScaleBase: 1.3,
      xScaleVarience: 0.15,
      yScaleVarience: 0.15,
      xSkewVarience: 0.2,
      ySkewVarience: 0.0,
      initialX: 0.0,
      initialY: 0.4,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.00048,
      period: (4 * Math.PI),
      
      spin_delay: -1.0,
      spin_radians: 2.0,
      spin_translateX: -0.6,
      spin_translateY: -0.0,
      spin_speed: 0.0026,
    }
    
    let wave7Movement = {
      texture: 6,
      offSetX: 0.04,
      offSetY: .69,
      xScaleBase: 0.8,
      yScaleBase: 1.0,
      xScaleVarience: 0.1,
      yScaleVarience: 0.25,
      xSkewVarience: 0.15,
      ySkewVarience: 0.0,
      initialX: 0.3,
      initialY: 0.4,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.0006,
      period: (4 * Math.PI),
      
      spin_delay: -1.0,
      spin_radians: 3.0,
      spin_translateX: -0.4,
      spin_translateY: -0.2,
      spin_speed: 0.0025,
    }
    
    let wave8Movement = {
      texture: 7,
      offSetX: .37,
      offSetY: .69,
      texture_offset: 0.0,
      xScaleBase: 1.5,
      yScaleBase: 0.8,
      xScaleVarience: 0.0,
      yScaleVarience: -0.05,
      xSkewVarience: 0.2,
      ySkewVarience: 0.0,
      initialX: -0.11,
      initialY: 0.4,
      translateX: 0.0,
      translateY: 0.0,
      delay: 4.5,
      speed: 0.00051,
      period: (4 * Math.PI),
      
      spin_delay: -1.0,
      spin_radians: 2.0,
      spin_translateX: -0.4,
      spin_translateY: -0.1,
      spin_speed: 0.002,
    }

    let imagesLoaded = function() {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
    
      let myReq;
      let oldTime = 0;
      let waveStartTime = performance.now();
      let waveDeltaTime = 0;
      
      function clipAndPosition(time) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        waveDeltaTime = time - waveStartTime;
        drawWaves(waveDeltaTime, wave1Movement);
        drawWaves(waveDeltaTime, wave2Movement);
        drawWaves(waveDeltaTime, wave3Movement);
        drawWaves(waveDeltaTime, wave4Movement);
        drawWaves(waveDeltaTime, wave5Movement);
        drawWaves(waveDeltaTime, wave6Movement);
        drawWaves(waveDeltaTime, wave7Movement);
        drawWaves(waveDeltaTime, wave8Movement);
      }

      function animate(time) {
        clipAndPosition(time); // clip and move
        myReq = window.requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);

      // Change to rotation/spin shaders on click
      function handleClick () {
        scene.dataset.signIn = 'true';
        function drawWaveSpin (time, movement) {
          gl.uniform2f(offsetLocation, movement.offSetX, movement.offSetY);
          gl.uniform2f(scaleBaseLocation, movement.xScaleBase, movement.yScaleBase);
          gl.uniform2f(scaleVarienceLocation, movement.xScaleVarience, movement.yScaleVarience);
          gl.uniform2f(skewVarienceLocation, movement.xSkewVarience, movement.ySkewVarience);
          gl.uniform2f(initialLocation, movement.initialX, movement.initialY);
          gl.uniform2f(translateLocation, movement.translateX, movement.translateY);
          gl.uniform1f(timeLocation, ((waveDeltaTime * movement.speed) + movement.delay) % movement.period);
        
          // spin uniforms
          gl.uniform1f(spinTimerLocation, (time * movement.spin_speed) + movement.spin_delay);
          gl.uniform2f(spinTranslateLocation, movement.spin_translateX, movement.spin_translateY);
          gl.uniform1f(spinDegreesLocation, movement.spin_radians);

          gl.uniform1f(spinFragTimeLocation, (time * movement.spin_speed) + -1.0);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        let deltaTime = 0;
        let startTime = performance.now();
        function spinOutAnimation(time) {
          deltaTime = time - startTime;
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          drawWaveSpin(deltaTime, wave1Movement);
          drawWaveSpin(deltaTime, wave2Movement);
          drawWaveSpin(deltaTime, wave3Movement);
          drawWaveSpin(deltaTime, wave4Movement);
          drawWaveSpin(deltaTime, wave5Movement);
          drawWaveSpin(deltaTime, wave6Movement);
          drawWaveSpin(deltaTime, wave7Movement);
          drawWaveSpin(deltaTime, wave8Movement);
          window.requestAnimationFrame(spinOutAnimation);
        }
        
        cancelAnimationFrame(myReq);
        spinOutAnimation(startTime);
      }
      document.onclick = handleClick;
    }

    let textures = [];
    function initImages() {
      let images = [];
      let urls = [
        waves.wavesbwpng
      ];
      let imagesToLoad = urls.length;

      function loadImage(url, callback) {
        let image = new Image();
        image.onload = callback
        image.src = url;
        return image;
      }

      let onImageLoad = function(event) {
        --imagesToLoad;
        
        let image_index = urls.indexOf(event.target.attributes.src.value);
        
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + image_index);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, event.target);

        // add the texture to the array of textures.
        textures[image_index] = texture;
        
        // If all the images are loaded call imagesLoaded.
        if (imagesToLoad == 0) {
          console.log('after all images loaded');
          imagesLoaded();
        }
      };
    
      for (let i = 0; i < urls.length; ++i) {
        let image = loadImage(urls[i], onImageLoad);
        images.push(image);
      }
    }

    initImages();
  }
  handleSignIn() {
    
  }

  render() {
    return (
      <div className="test-wrapper">
        <canvas className="canvas" ref={this.attachGL}>
          HTML5 is not supported.
        </canvas>
        <div id="scene">
          <div class="fxaccounts-container">
            <div id="left-divider">
              <div id="firefox-logo"></div>
              <h1 id="title">Already using Firefox?</h1>
              <p class="content">Sign in to your account and we’ll sync the bookmarks, passwords and other great things you’ve saved to Firefox on other devices.</p>
              <a href="https://www.mozilla.org/en-US/firefox/features/sync/"target="_blank">Learn more about Firefox Accounts</a>
            </div>
            <div class="fxaccounts" id="fxa-iframe-config">
            click here
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const StartupOverlay = connect()(injectIntl(_StartupOverlay));
