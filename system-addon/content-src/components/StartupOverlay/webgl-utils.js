
export const vertexShader = `
  precision lowp float;
  const float PI = 3.14159;

  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_coord;
  uniform vec2 u_scale_base;
  uniform vec2 u_scale_varience;
  uniform vec2 u_skew_varience;
  uniform vec2 u_translate;
  
  uniform vec2 u_spin_translate;
  uniform float u_degrees;
  uniform float u_spin_timer;

  varying vec2 v_texCoord;
  
  mat2 scale(vec2 _scale) {
  return mat2(_scale.x, 0.0,
              0.0, _scale.y);
  }

  mat2 skew(vec2 _skew) {
    return mat2(1.0, _skew.x,
                _skew.y, 1.0);
  }

  mat2 rotate(float _angle) {
    return mat2(cos(_angle), -sin(_angle),
                sin(_angle), cos(_angle));
  }

  void main(void) {
    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
    
    zeroToOne -= vec2(0.5); //move to 0,0 to shift from
    
    float time = max(u_time, 3.0 * PI/2.0);
    time = min(time, 7.0 * PI/2.0);
    float x_scale = u_scale_base.x + u_scale_varience.x * (sin(time) + 1.0);
    float y_scale = u_scale_base.y + u_scale_varience.y * (sin(time) + 1.0);
    zeroToOne = scale(vec2(x_scale, y_scale)) * zeroToOne;
    
    float x_skew = u_skew_varience.x * (sin(time) + 1.0);
    float y_skew = u_skew_varience.y * (sin(time) + 1.0);
    zeroToOne = zeroToOne * skew(vec2(x_skew, y_skew));
    
    zeroToOne -= vec2(u_coord.x, u_coord.y); //initial positioning
    zeroToOne -= vec2(u_translate * (sin(time) + 1.0));
    
    // Spin
    float spin_time = max(u_spin_timer, 0.0); // allow delay if passed in - replace 0.0 with variable
    spin_time = min(spin_time, u_degrees); // count up by spin_time to a certain degree, don't go past that degree
    zeroToOne = rotate(-spin_time) * zeroToOne; // -spin_time to always rotate clockwise

    float translateTime = min(u_spin_timer, 1.0); // 1.0 = don't go further than amount declared
    translateTime = max(translateTime, 0.0); // delay at first - currently 0.0
    zeroToOne -= vec2(u_spin_translate * translateTime);
    // end spin
    
    zeroToOne += vec2(0.5); //return back to desired position

    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    v_texCoord = a_texCoord;
   }
`;


export const fragmentShader = `
  precision lowp float;

  uniform sampler2D u_image;
  uniform vec2 u_size;
  uniform vec2 u_offset;
  uniform float u_spin_time_frag;

  varying vec2 v_texCoord;

  void main(void) {
    vec2 texture_point = v_texCoord;
    texture_point *= u_size;
    texture_point += u_offset;
    vec4 color = texture2D(u_image, texture_point);

    color.r = u_spin_time_frag;
    color.a = min(0.9, color.a); //set variable here for opacity
    color.b = v_texCoord.x;
    color.g = v_texCoord.y;
    
    gl_FragColor = color;
    gl_FragColor.rgb *= gl_FragColor.a;
  }
`;

export function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  let width  = canvas.clientWidth  * multiplier | 0;
  let height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export function setRectangle(gl, x, y, width, height) {
  let x1 = x;
  let x2 = x + width;
  let y1 = y;
  let y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}
