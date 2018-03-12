import {allWaves, quantumLogo} from "./image-addresses.js";
import {fragmentShader, resizeCanvasToDisplaySize, setRectangle, vertexShader} from "./webgl-utils";
import {actionCreators as ac} from "common/Actions.jsm";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import React from "react";

const wave1Movement = {
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
  spin_speed: 0.002
};

const wave2Movement = {
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
  spin_speed: 0.0028
};

const wave3Movement = {
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
  spin_translateX: 0.4,
  spin_translateY: 0.28,
  spin_speed: 0.0027
};

const wave4Movement = {
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

  spin_delay: -1.0,
  spin_radians: 0.5,
  spin_translateX: 0.4,
  spin_translateY: -0.3,
  spin_speed: 0.0026
};

const wave5Movement = {
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
  spin_speed: 0.0025
};

const wave6Movement = {
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
  spin_translateY: -0.3,
  spin_speed: 0.0026
};

const wave7Movement = {
  offSetX: 0.04,
  offSetY: 0.69,
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
  spin_translateY: -0.4,
  spin_speed: 0.0025
};

const wave8Movement = {
  offSetX: 0.37,
  offSetY: 0.69,
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
  spin_translateX: -0.45,
  spin_translateY: -0.6,
  spin_speed: 0.002
};

export class _StartupOverlay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.locations = {};
    this.gl = {};
    this.attachGL = this.attachGL.bind(this);
    this.animate = this.animate.bind(this);
    this.drawWaves = this.drawWaves.bind(this);
    this.initImages = this.initImages.bind(this);
    this.removeOverlay = this.removeOverlay.bind(this);
    this.setUpShader = this.setUpShader.bind(this);
    this.attachUniforms = this.attachUniforms.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.clickSkip = this.clickSkip.bind(this);

    this.state = {emailInput: ""};
  }

  drawWaves(waveTime, movement, spinTime) {
    let {gl} = this;
    gl.uniform2f(this.locations.offsetLocation, movement.offSetX, movement.offSetY);
    gl.uniform2f(this.locations.scaleBaseLocation, movement.xScaleBase, movement.yScaleBase);
    gl.uniform2f(this.locations.scaleVarienceLocation, movement.xScaleVarience, movement.yScaleVarience);
    gl.uniform2f(this.locations.skewVarienceLocation, movement.xSkewVarience, movement.ySkewVarience);
    gl.uniform2f(this.locations.initialLocation, movement.initialX, movement.initialY);
    gl.uniform2f(this.locations.translateLocation, movement.translateX, movement.translateY);
    gl.uniform1f(this.locations.timeLocation, ((waveTime * movement.speed) + movement.delay) % movement.period);

    if (this.spin) {
      // spin uniforms
      gl.uniform1f(this.locations.spinTimerLocation, (spinTime * movement.spin_speed) + movement.spin_delay);
      gl.uniform2f(this.locations.spinTranslateLocation, movement.spin_translateX, movement.spin_translateY);
      gl.uniform1f(this.locations.spinDegreesLocation, movement.spin_radians);
      gl.uniform1f(this.locations.spinFragTimeLocation, (spinTime * movement.spin_speed) + -1.0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  animate(time) {
    let waveDeltaTime = time - this.waveStartTime;
    let spinDeltaTime = time - this.spinStartTime;
    let {gl} = this;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.drawWaves(waveDeltaTime, wave1Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave2Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave3Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave4Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave5Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave6Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave7Movement, spinDeltaTime);
    this.drawWaves(waveDeltaTime, wave8Movement, spinDeltaTime);

    this.animationReq = window.requestAnimationFrame(this.animate);
  }

  initImages() {
    let {gl} = this;
    let image = new Image();

    image.onload = () => {
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      this.waveStartTime = performance.now();
      requestAnimationFrame(this.animate);
      this.scene = document.querySelector(".firstrun-scene");
      this.scene.dataset.content = "true";
    };
    image.src = allWaves;
  }

  setUpShader(source, type) {
    let {gl} = this;
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // Something went wrong during compilation; get the error
      throw gl.getShaderInfoLog(shader);
    }
    return shader;
  }

  attachUniforms(program) {
    let {gl} = this;
    // Standard locations
    this.locations.positionLocation = gl.getAttribLocation(program, "a_position");
    this.locations.texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Wave uniforms
    this.locations.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    this.locations.initialLocation = gl.getUniformLocation(program, "u_coord");
    this.locations.scaleBaseLocation = gl.getUniformLocation(program, "u_scale_base");
    this.locations.scaleVarienceLocation = gl.getUniformLocation(program, "u_scale_varience");
    this.locations.skewVarienceLocation = gl.getUniformLocation(program, "u_skew_varience");
    this.locations.translateLocation = gl.getUniformLocation(program, "u_translate");
    this.locations.timeLocation = gl.getUniformLocation(program, "u_time");
    this.locations.sizeLocation = gl.getUniformLocation(program, "u_size");
    this.locations.offsetLocation = gl.getUniformLocation(program, "u_offset");

    // Spin uniforms
    this.locations.spinTimerLocation = gl.getUniformLocation(program, "u_spin_timer");
    this.locations.spinDegreesLocation = gl.getUniformLocation(program, "u_degrees");
    this.locations.spinTranslateLocation = gl.getUniformLocation(program, "u_spin_translate");
    this.locations.spinFragTimeLocation = gl.getUniformLocation(program, "u_spin_time_frag");
  }

  attachGL(canvas) {
    this.scene = document.querySelector(".firstrun-scene");
    setTimeout(() => {
      this.scene.dataset.content = "true";
    }, 10);

    // Only allow Mac or Windows 8 or higher to run the webGL version.
    if (navigator.platform.toUpperCase().includes("MAC") >= 0) {
      document.documentElement.classList.add("mac");
    } else if (navigator.platform.toUpperCase().includes("WIN") >= 0 &&
               parseInt(navigator.oscpu.match(/Windows NT (\d+\.\d+)/)[1], 10) >= 6.2) {
      document.documentElement.classList.add("win8up");
    } else {
      document.documentElement.classList.add("no-gl");
      this.props.dispatch(ac.UserEvent({event: "GL_FAILED"}));
      return;
    }

    this.gl = canvas.getContext("webgl",
      {failIfMajorPerformanceCaveat: true, powerPreference: "high-performance"});
    let {gl} = this;
    if (!gl) {
      document.documentElement.classList.add("no-gl");
      this.props.dispatch(ac.UserEvent({event: "GL_FAILED"}));
      return;
    }

    // GL is enabled, send event
    this.props.dispatch(ac.UserEvent({event: "GL_ENABLED"}));

    let program = gl.createProgram();
    let vertShader = this.setUpShader(vertexShader, gl.VERTEX_SHADER);
    let fragShader = this.setUpShader(fragmentShader, gl.FRAGMENT_SHADER);

    gl.attachShader(program, fragShader);
    gl.attachShader(program, vertShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    this.attachUniforms(program);

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    resizeCanvasToDisplaySize(gl.canvas);

    // Set a rectangle the same size as the canvas.
    setRectangle(gl, 0, 0, canvas.width, canvas.height);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Provide texture coordinates for the rectangle.
    let texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0
    ]), gl.STATIC_DRAW);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color to transparent black
    gl.clearColor(0, 0, 0, 0);

    gl.enableVertexAttribArray(this.locations.positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Set blending and turn off depth
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    // 2 components per iteration
    let size = 2;
    // the data is 32bit floats
    let type = gl.FLOAT;
    // don't normalize the data
    let normalize = false;
    // 0 = move forward size * sizeof(type) each iteration to get the next position
    let stride = 0;
    // start at the beginning of the buffer
    let offset = 0;
    gl.vertexAttribPointer(
        this.locations.positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(this.locations.texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(
        this.locations.texcoordLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(this.locations.resolutionLocation, canvas.width, canvas.height);
    // Width and height of each wave
    gl.uniform2f(this.locations.sizeLocation, 0.275, 0.275);

    this.initImages();
  }

  removeOverlay(e) {
    this.scene.dataset.signIn = "true";
    if (document.documentElement.classList.contains("no-gl")) {
      document.querySelector(".test-wrapper").classList.add("fade-out");
      setTimeout(() => {
        document.querySelector(".test-wrapper").style.display = "none";
      }, 400);
      return;
    }

    // Change to spin
    this.spinStartTime = performance.now();
    this.spin = true;

    // hide elements and canvas after spin finished
    setTimeout(() => {
      document.querySelector(".test-wrapper").style.display = "none";
    }, 1300);

    cancelAnimationFrame(this.animationReq);
    window.requestAnimationFrame(this.animate);
  }

  onInputChange(e) {
    this.setState({emailInput: e.target.value});
  }

  onSubmit() {
    this.props.dispatch(ac.UserEvent({event: "SUBMIT_EMAIL"}));
    window.addEventListener("focus", this.removeOverlay);
  }

  clickSkip() {
    this.props.dispatch(ac.UserEvent({event: "CLICK_SKIP"}));
    this.removeOverlay();
  }

  render() {
    return (
      <div className="test-wrapper">
        <canvas className="canvas" ref={this.attachGL}>
          HTML5 is not supported.
        </canvas>
        <div className="firstrun-scene">
          <div className="fxaccounts-container">
            <div className="firstrun-left-divider">
              <img className="firstrun-firefox-logo" src={quantumLogo} />
              <h1 className="firstrun-title">Already using Firefox?</h1>
              <p className="firstrun-content">Sign in to your account and we’ll sync the bookmarks, passwords and other great things you’ve saved to Firefox on other devices.</p>
              <a className="firstrun-link" href="https://www.mozilla.org/en-US/firefox/features/sync/" target="_blank" rel="noopener noreferrer">Learn more about Firefox Accounts</a>
            </div>
            <div className="firstrun-sign-in">
              <p className="form-header">Enter your email <span>to continue to Firefox Sync</span></p>
              <form method="get" action="https://accounts.firefox.com" target="_blank" rel="noopener noreferrer" onSubmit={this.onSubmit}>
                <input name="service" type="hidden" value="sync" />
                <input name="forceExperiment" type="hidden" value="emailFirst" />
                <input name="forceExperimentGroup" type="hidden" value="treatment" />
                <input name="context" type="hidden" value="fx_desktop_v3" />
                <input className="email-input" name="email" type="email" required="true" placeholder="Email" onChange={this.onInputChange} />
                <div className="extra-links">By proceding you agree to the
                  <a href="https://accounts.firefox.com/legal/terms" target="_blank" rel="noopener noreferrer"> Terms of service </a>
                  and<a href="https://accounts.firefox.com/legal/privacy" target="_blank" rel="noopener noreferrer"> Privacy Notice</a>
                </div>
                <button className="continue-button" type="submit">Continue</button>
              </form>
              <button className="skip-button" disabled={!!this.state.emailInput} onClick={this.clickSkip}>Skip this step</button>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

export const StartupOverlay = connect()(injectIntl(_StartupOverlay));
