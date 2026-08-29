function neonEffect(element) {
    const p = document.querySelector(element);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 720;
    if (isMobile){
        console.log('dont support mobile device');
        return;
    };
    const text = p.textContent.trim();
    p.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.style.textShadow = "0px 0px 3px, 0px 0px 8px, 0px 0px 12px";
    p.appendChild(wrapper);
    
    const spans = [];
    for (const char of text) {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        wrapper.appendChild(span);
        spans.push(span);
    }
    function randomDim() {
        const i = Math.floor(Math.random() * spans.length);
        const s = spans[i];
        s.style.opacity = "0.3";
        setTimeout(() => {
            s.style.opacity = "1";
        }, 400);
    }
    function loop() {
        randomDim();
        const delay = 500 + Math.random() * 1100;
        setTimeout(loop, delay);
    }
    loop()
}
function textWaveEffectTitle(element) {
    const textElement = document.querySelector(element);
    if (!textElement) return;

    const rawText = textElement.innerHTML;
    const tokens = rawText.split(/(\s+)/);

    textElement.innerHTML = tokens.map(token => {
        if (/\s+/.test(token)) {
            return ' ';
        }

        const chars = Array.from(token).map(char => {
            if (char === ' ') {
                return '<span style="width:0.5em;">&nbsp;</span>';
            }
            return `<span class="wave-char">${char}</span>`;
        }).join('');

        return `<span class="wave-word" style="display:inline-block; white-space:nowrap;">${chars}</span>`;
    }).join('');

    const spans = Array.from(textElement.querySelectorAll('.wave-char'));
    const totalChars = spans.length;

    const waves = [];

    function createWave() {
        waves.push({
            position: 0,
            speed: 0.06
        });
    }

    function calculateIntensity(charIndex, wavePosition) {
        const distance = Math.abs(charIndex - wavePosition);
        const waveWidth = 6;

        if (distance > waveWidth / 2) return 0;

        return Math.max(0, Math.cos((distance / (waveWidth / 2)) * Math.PI / 2));
    }

    function applyEffect(span, totalIntensity) {
        const intensity = Math.min(1, totalIntensity);

        span.style.display = 'inline-block';

        const opacity = 0.5 + (intensity * 0.5);
        const scale = 1 + (intensity * 0.1);

        span.style.opacity = opacity;
        span.style.transform = `scale(${scale})`;

        if (intensity > 0) {
            span.style.textShadow = `0 0 ${intensity * 10}px`;
        } else {
            span.style.textShadow = '';
        }
    }

    function animate() {
        for (let i = waves.length - 1; i >= 0; i--) {
            waves[i].position += waves[i].speed;
            if (waves[i].position > totalChars + 2.5) {
                waves.splice(i, 1);
            }
        }

        spans.forEach((span, index) => {
            if (span.textContent.trim() !== '') {
                let totalIntensity = 0;

                waves.forEach(wave => {
                    totalIntensity += calculateIntensity(index, wave.position);
                });

                applyEffect(span, totalIntensity);
            }
        });

        requestAnimationFrame(animate);
    }

    createWave();
    animate();

    setInterval(createWave, 2000);
}
function textWaveEffectDescription(el) {
    const textElement = document.querySelector(el);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 720;
    
    if (!textElement) return;

    if (textElement.dataset.wavePrepared === '1') return;

    const skipTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION']);

    function buildWaveFragment(text) {
        const fragment = document.createDocumentFragment();
        const tokens = text.split(/(\s+)/);

        tokens.forEach(token => {
            if (token === '') return;

            if (/^\s+$/.test(token)) {
                fragment.appendChild(document.createTextNode(token));
                return;
            }

            const word = document.createElement('span');
            word.className = 'wave-word';
            word.style.display = 'inline-block';
            word.style.whiteSpace = 'nowrap';

            Array.from(token).forEach(char => {
                const span = document.createElement('span');
                span.className = 'wave-char';
                span.textContent = char;
                word.appendChild(span);
            });

            fragment.appendChild(word);
        });

        return fragment;
    }

    function wrapTextNodes(node) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.nodeValue === '') return;
                child.replaceWith(buildWaveFragment(child.nodeValue));
                return;
            }

            if (child.nodeType !== Node.ELEMENT_NODE) return;
            if (skipTags.has(child.tagName)) return;
            if (child.classList.contains('wave-char') || child.classList.contains('wave-word')) return;

            wrapTextNodes(child);
        });
    }

    wrapTextNodes(textElement);
    textElement.dataset.wavePrepared = '1';
    
    const spans = Array.from(textElement.querySelectorAll('.wave-char'));
    const totalChars = spans.length;
    if (totalChars === 0) return;

    const waves = [];
    const config = isMobile ? {
        speed: 0.5,
        waveWidth: 6,
        waveInterval: 4000,
        fps: 30
    } : {
        speed: 0.09,
        waveWidth: 8,
        waveInterval: 2500,
        fps: 60
    };
    let lastFrameTime = 0;
    const frameInterval = isMobile ? (1000 / config.fps) : 0;
    
    function createWave() {
        waves.push({ position: 0.5, speed: config.speed });
    }
    
    function calculateIntensity(charIndex, wavePosition) {
        const distance = Math.abs(charIndex - wavePosition);
        const halfWidth = config.waveWidth / 2;
        
        if (distance > halfWidth) return 0;
        
        const intensity = Math.cos((distance / halfWidth) * Math.PI / 2);
        return Math.max(0, intensity);
    }
    
    function applyEffect(span, totalIntensity) {
        const intensity = Math.min(1, totalIntensity);
        
        span.style.display = 'inline-block';
        
        const opacity = 0.5 + (intensity * 0.5);
        const scale = 1 + (intensity * 0.1);
        
        span.style.opacity = opacity;
        span.style.transform = `scale(${scale})`;
        
        if (intensity > 0) {
            const shadowBlur = intensity * 10;
            span.style.textShadow = `0 0 ${shadowBlur}px`;
        } else {
            span.style.textShadow = '';
        }
    }
    
    function animate(currentTime) {
        if (isMobile) {
            if (currentTime - lastFrameTime < frameInterval) {
                requestAnimationFrame(animate);
                return;
            }
            lastFrameTime = currentTime;
        }
        for (let i = waves.length - 1; i >= 0; i--) {
            waves[i].position += waves[i].speed;
            if (waves[i].position > totalChars + 2.5) {
                waves.splice(i, 1);
            }
        }
        spans.forEach((span, charIndex) => {
            if (span.textContent.trim() !== '') {
                let totalIntensity = 0;
                waves.forEach(wave => {
                    totalIntensity += calculateIntensity(charIndex, wave.position);
                });
                
                applyEffect(span, totalIntensity);
            }
        });
        
        requestAnimationFrame(animate);
    }
    createWave();
    requestAnimationFrame(animate);
    setInterval(createWave, config.waveInterval);
}
function scramEffect1(el) {
    const element = document.querySelector(el);
    const text = element.textContent;
    if (!text) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-/:;?<>';
    const writeSpeed = 5;      
    const eraseSpeed = 40;
    const scrambleDelay = 40;
    const scrambleFrames = 3; 
    const loopDelay = 2500;
    async function scrambleCurrent(targetText) {
        for (let f = 0; f < scrambleFrames; f++) {
            let output = '';
            for (let i = 0; i < targetText.length; i++) {
                if (Math.random() < 0.3) {
                    output += chars[Math.floor(Math.random() * chars.length)];
                } else {
                    output += targetText[i];
                }
            }
            element.textContent = output;
            await new Promise(r => setTimeout(r, scrambleDelay));
        }
        element.textContent = targetText;
    }
    async function writeText(str) {
        let current = '';
        for (let i = 0; i < str.length; i++) {
        current += str[i];
        await scrambleCurrent(current);
        await new Promise(r => setTimeout(r, writeSpeed));
        }
    }
    async function eraseText() {
        let current = element.textContent;
        while (current.length > 0) {
        current = current.slice(0, -1);
        element.textContent = current;
        await new Promise(r => setTimeout(r, eraseSpeed));
        }
    }
    async function loop() {
        while (true) {
        await writeText(text);
            await new Promise(r => setTimeout(r, loopDelay));
            await eraseText();
            await new Promise(r => setTimeout(r, 100));
        }
    }

    loop();
}
function scramEffect2(element) {
    const textElement = document.querySelector(element);
    const originalText = textElement.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    
    let currentIndex = 0;
    let scrambleFrames = 0;
    const scrambleDuration = 6;
    const delayBetweenChars = 50;

    function getRandomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function scrambleText() {
        if (currentIndex >= originalText.length) {
            setTimeout(() => {
                currentIndex = 0;
                scrambleFrames = 0;
                textElement.textContent = '';
                scrambleText();
            }, 3000);
            return;
        }

        let displayText = '';
        for (let i = 0; i < currentIndex; i++) {
            displayText += originalText[i];
        }
        if (scrambleFrames < scrambleDuration) {
            displayText += getRandomChar();
            scrambleFrames++;
        } else {
            displayText += originalText[currentIndex];
            currentIndex++;
            scrambleFrames = 0;
        }
        for (let i = currentIndex + 1; i < originalText.length; i++) {
            if (originalText[i] === ' ') {
                displayText += ' ';
            } else {
                displayText += getRandomChar();
            }
        }

        textElement.textContent = displayText;
        setTimeout(scrambleText, delayBetweenChars);
    }
    scrambleText();
}
