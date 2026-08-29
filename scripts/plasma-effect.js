function createPlasmaEffect(options = {}) {
    const settings = {
        container: options.container || 'body',
        color: options.color || '#f0f0f0',
        speed: options.speed ?? 0.5,
        direction: options.direction ?? 1,
        scale: options.scale ?? 1.1,
        opacity: options.opacity ?? 0.9,
        mouseInteractive: options.mouseInteractive ?? false,
        renderScale: options.renderScale ?? 0.65,
        maxFPS: options.maxFPS ?? 45,
        iterations: options.iterations ?? 60,
        precision: options.precision ?? 'highp',
        powerPreference: options.powerPreference ?? 'default',
        antialias: options.antialias ?? false,
        maxDPR: options.maxDPR ?? 2,
    };

    function parseHexColor(value) {
        const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
        return match
            ? {
                r: parseInt(match[1], 16) / 255,
                g: parseInt(match[2], 16) / 255,
                b: parseInt(match[3], 16) / 255,
            }
            : { r: 0.94, g: 0.94, b: 0.94 };
    }

    const container = document.querySelector(settings.container);
    if (!container) throw new Error(`Container "${settings.container}" does not exist`);

    const wrapper = document.createElement('div');
    wrapper.className = 'plasma-container';
    wrapper.style.cssText = 'position: fixed; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: -1;';

    const canvas = document.createElement('canvas');
    canvas.id = `plasma-${Date.now()}`;
    canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, settings.maxDPR) * settings.renderScale;
    const gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: settings.antialias,
        premultipliedAlpha: true,
        powerPreference: settings.powerPreference,
    });
    if (!gl) throw new Error('WebGL2 is not supported');

    const vertexShaderSource = `#version 300 es
precision ${settings.precision} float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

    const fragmentShaderSource = `#version 300 es
precision ${settings.precision} float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
uniform float uIterations;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
    vec2 center = iResolution.xy * 0.5;
    C = (C - center) / uScale + center;
    vec2 mouseOffset = (uMouse - center) * 0.0002;
    C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

    float i, d, z, T = iTime * uSpeed * uDirection;
    vec3 O, p, S;
    for (vec2 r = iResolution.xy, Q; ++i < uIterations; O += o.w / d * o.xyz) {
        p = z * normalize(vec3(C - 0.5 * r, r.y));
        p.z -= 4.;
        S = p;
        d = p.y - T;
        p.x += 0.4 * (1. + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);
        Q = p.xz *= mat2(cos(p.y + vec4(0., 11., 33., 0.) - T));
        z += d = abs(sqrt(length(Q * Q)) - 0.25 * (5. + S.y)) / 3. + 8e-4;
        o = 1. + sin(S.y + p.z * 0.5 + S.z - length(S - p) + vec4(2., 1., 0., 8.));
    }
    o.xyz = tanh(O / 1e4);
}

bool finite1(float x) { return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c) {
    return vec3(
        finite1(c.r) ? c.r : 0.0,
        finite1(c.g) ? c.g : 0.0,
        finite1(c.b) ? c.b : 0.0
    );
}

void main() {
    vec4 o = vec4(0.0);
    mainImage(o, gl_FragCoord.xy);
    vec3 rgb = sanitize(o.rgb);
    float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
    vec3 customColor = intensity * uCustomColor;
    vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
    float alpha = length(rgb) * uOpacity;
    fragColor = vec4(finalColor, alpha);
}`;

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(message || 'Unable to compile shader');
        }
        return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, 'position');
    gl.bindAttribLocation(program, 1, 'uv');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link shader program');
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    const uniforms = {
        iResolution: gl.getUniformLocation(program, 'iResolution'),
        iTime: gl.getUniformLocation(program, 'iTime'),
        uCustomColor: gl.getUniformLocation(program, 'uCustomColor'),
        uUseCustomColor: gl.getUniformLocation(program, 'uUseCustomColor'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uDirection: gl.getUniformLocation(program, 'uDirection'),
        uScale: gl.getUniformLocation(program, 'uScale'),
        uOpacity: gl.getUniformLocation(program, 'uOpacity'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uMouseInteractive: gl.getUniformLocation(program, 'uMouseInteractive'),
        uIterations: gl.getUniformLocation(program, 'uIterations'),
    };

    const color = parseHexColor(settings.color);
    const state = {
        direction: settings.direction,
        speed: settings.speed,
        scale: settings.scale,
        opacity: settings.opacity,
        iterations: settings.iterations,
        useCustomColor: 1,
        customColor: new Float32Array([color.r, color.g, color.b]),
        mouseInteractive: settings.mouseInteractive ? 1 : 0,
        mouse: new Float32Array([0, 0]),
    };

    let resizeTimer = null;
    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const renderWidth = Math.max(1, Math.floor(width * pixelRatio));
        const renderHeight = Math.max(1, Math.floor(height * pixelRatio));
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        gl.viewport(0, 0, renderWidth, renderHeight);
        gl.uniform2f(uniforms.iResolution, renderWidth, renderHeight);
    }

    function scheduleResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    }

    resize();
    window.addEventListener('resize', scheduleResize);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function updateMouse(event) {
        if (state.mouseInteractive <= 0) return;
        const rect = canvas.getBoundingClientRect();
        state.mouse[0] = event.clientX - rect.left;
        state.mouse[1] = event.clientY - rect.top;
    }

    canvas.addEventListener('mousemove', updateMouse);
    canvas.addEventListener('touchmove', (event) => {
        if (event.touches.length === 0) return;
        updateMouse(event.touches[0]);
    }, { passive: true });
    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 0) return;
        updateMouse(event.touches[0]);
    }, { passive: true });
    canvas.addEventListener('mouseleave', () => {
        state.mouse[0] = 0;
        state.mouse[1] = 0;
    });

    gl.uniform3fv(uniforms.uCustomColor, state.customColor);
    gl.uniform1f(uniforms.uUseCustomColor, state.useCustomColor);
    gl.uniform1f(uniforms.uSpeed, 0.4 * state.speed);
    gl.uniform1f(uniforms.uDirection, state.direction);
    gl.uniform1f(uniforms.uScale, state.scale);
    gl.uniform1f(uniforms.uOpacity, state.opacity);
    gl.uniform1f(uniforms.uMouseInteractive, state.mouseInteractive);
    gl.uniform2fv(uniforms.uMouse, state.mouse);
    gl.uniform1f(uniforms.uIterations, state.iterations);

    const startTime = performance.now();
    let animationFrame = null;
    let lastFrameTime = 0;
    const frameDuration = 1000 / settings.maxFPS;

    function render(now) {
        animationFrame = requestAnimationFrame(render);
        if (settings.maxFPS < 60) {
            const elapsed = now - lastFrameTime;
            if (elapsed < frameDuration) return;
            lastFrameTime = now - (elapsed % frameDuration);
        }

        gl.uniform1f(uniforms.iTime, (now - startTime) * 0.001);
        gl.uniform2fv(uniforms.uMouse, state.mouse);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    animationFrame = requestAnimationFrame(render);

    return {
        setColor(value) {
            const nextColor = parseHexColor(value);
            state.customColor[0] = nextColor.r;
            state.customColor[1] = nextColor.g;
            state.customColor[2] = nextColor.b;
            gl.uniform3fv(uniforms.uCustomColor, state.customColor);
        },
        setSpeed(value) {
            state.speed = value;
            gl.uniform1f(uniforms.uSpeed, 0.4 * state.speed);
        },
        setDirection(value) {
            state.direction = value;
            gl.uniform1f(uniforms.uDirection, state.direction);
        },
        setScale(value) {
            state.scale = value;
            gl.uniform1f(uniforms.uScale, state.scale);
        },
        setOpacity(value) {
            state.opacity = value;
            gl.uniform1f(uniforms.uOpacity, state.opacity);
        },
        setMouseInteractive(value) {
            state.mouseInteractive = value ? 1 : 0;
            gl.uniform1f(uniforms.uMouseInteractive, state.mouseInteractive);
        },
        setIterations(value) {
            state.iterations = value;
            gl.uniform1f(uniforms.uIterations, state.iterations);
        },
        destroy() {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', scheduleResize);
            wrapper.remove();
        },
    };
}