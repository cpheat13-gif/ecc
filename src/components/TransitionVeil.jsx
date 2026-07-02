import { useEffect, useRef } from 'react';

// Full-screen WebGL liquid-glass ripple that plays once per `tick` change.
// Purely decorative overlay — pointer-events: none, fails silently without WebGL.

const FRAG = `
precision mediump float;
uniform float u_t;
uniform vec2 u_res;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv - vec2(0.5, 0.45);
  p.x *= aspect;
  float d = length(p);

  float ring = u_t * 1.5;
  float w = 0.16 + 0.22 * u_t;

  float band = smoothstep(ring - w, ring, d) * (1.0 - smoothstep(ring, ring + w, d));
  float crest = smoothstep(ring - 0.03, ring, d) * (1.0 - smoothstep(ring, ring + 0.03, d));

  float fade = 1.0 - smoothstep(0.55, 1.0, u_t);

  vec3 glass = vec3(0.995, 0.975, 0.945);
  vec3 ember = vec3(0.92, 0.35, 0.22);

  vec3 col = glass + ember * crest * 0.35;
  float alpha = (band * 0.5 + crest * 0.45) * fade;

  // soft center flash at the very start
  float flash = (1.0 - smoothstep(0.0, 0.22, u_t)) * (1.0 - smoothstep(0.0, 0.6, d)) * 0.35;
  alpha += flash;

  gl_FragColor = vec4(col, alpha);
}
`;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export default function TransitionVeil({ tick }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    glRef.current = {
      gl,
      uT: gl.getUniformLocation(prog, 'u_t'),
      uRes: gl.getUniformLocation(prog, 'u_res'),
    };
  }, []);

  useEffect(() => {
    if (!tick) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const ctx = glRef.current;
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const { gl, uT, uRes } = ctx;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);

    canvas.style.opacity = '1';
    const start = performance.now();
    const DURATION = 750;
    let raf;

    const frame = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (t < 1) raf = requestAnimationFrame(frame);
      else canvas.style.opacity = '0';
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[90] pointer-events-none w-full h-full"
      style={{ opacity: 0 }}
      aria-hidden="true"
    />
  );
}
