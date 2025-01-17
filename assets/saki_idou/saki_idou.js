let imageSrc = {
    nosaki: '/blog/assets/saki_idou/nosaki.png',
    saki: '/blog/assets/saki_idou/saki.png',
    desk: '/blog/assets/saki_idou/desk.png'
}

let soundSrc = {
    saki: '/blog/assets/saki_idou/saki.mp3',
    idou: '/blog/assets/saki_idou/idou.mp3',
    correct: '/blog/assets/saki_idou/correct.mp3',
    gomennasai: '/blog/assets/saki_idou/gomennasai.mp3',
    kuku: '/blog/assets/saki_idou/kuku.mp3'
}

Array.from(document.getElementsByClassName('saki-frame')).forEach(frame => {
    tohref = frame.getAttribute('data-tohref');

    const container = document.createElement('div');
    container.className = 'saki-container';
    container.setAttribute('tohref', tohref);
    frame.appendChild(container);

    const background = document.createElement('div');
    background.className = 'background';
    container.appendChild(background);

    const groundText = document.createElement('div');
    groundText.className = 'ground-text';
    groundText.innerText = '';
    background.appendChild(groundText);

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    background.appendChild(imageContainer);

    const image = document.createElement('img');
    image.src = imageSrc.nosaki;
    imageContainer.appendChild(image);

    const sliderArea = document.createElement('div');
    sliderArea.className = 'slider-area';
    container.appendChild(sliderArea);

    const flagContainer = document.createElement('div');
    flagContainer.className = 'flag-container';
    sliderArea.appendChild(flagContainer);

    const flag = document.createElement('div');
    flag.className = 'flag';
    flagContainer.appendChild(flag);

    const flagImage = document.createElement('img');
    flagImage.src = imageSrc.saki;
    flag.appendChild(flagImage);

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    sliderArea.appendChild(sliderContainer);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.step = 0.01;
    slider.value = 0;
    slider.className = 'slider';
    sliderContainer.appendChild(slider);

    const foreground = document.createElement('div');
    foreground.className = 'foreground';
    container.appendChild(foreground);

    const groundText2 = document.createElement('div');
    groundText2.className = 'ground-text';
    groundText2.innerText = '祥，移動';
    foreground.appendChild(groundText2);

    const imageContainer2 = document.createElement('div');
    imageContainer2.className = 'image-container';
    foreground.appendChild(imageContainer2);

    const image2 = document.createElement('img');
    image2.src = imageSrc.desk;
    imageContainer2.appendChild(image2);

    const result = document.createElement('div');
    result.className = 'result hidden';
    container.appendChild(result);
});

let soundCollection = [
    { name: 'saki', dom: new Audio(soundSrc.saki), volume: 1, time: (404 + 20), playing: false },
    { name: 'idou', dom: new Audio(soundSrc.idou), volume: 1, time: 417, playing: false },
    { name: 'correct', dom: new Audio(soundSrc.correct), volume: 1, time: 2000, playing: false },
    { name: 'gomennasai', dom: new Audio(soundSrc.gomennasai), volume: 1, time: 2000, playing: false },
    { name: 'kuku', dom: new Audio(soundSrc.kuku), volume: 0.2, time: 2000, playing: false }
];

function easeInOut(t, degree) {
    return t < 0.5 ? (0.5 / Math.pow(0.5, degree)) * Math.pow(t, degree) : 1 - (0.5 / Math.pow(0.5, degree)) * Math.pow(1 - t, degree);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isCorrectValue(value, correctValue = 60.0484, threshold = 2) {
    return Math.abs(value - correctValue) < threshold;
}

function playSound(soundName) {
    if (soundCollection.find(sound => sound.playing === true) != undefined) {
        sleep(soundCollection.find(sound => sound.playing === true).time).then(() => { playSound(soundName) })
        return
    }
    let soundNow = soundCollection.find(sound => sound.name === soundName);
    if (soundNow == undefined) return;
    soundNow.dom.volume = soundNow.volume
    soundNow.playing = true
    soundNow.dom.play()
    setTimeout(function () { soundNow.playing = false }, soundNow.time + 100)
}

function displayResult(container, value, correctValue, threshold) {
    tohref = container.getAttribute('tohref');

    let result;
    const resultElement = container.querySelector('.result');
    if (isCorrectValue(value, correctValue, threshold)) {
        playSound('correct');
        resultElement.innerText = '✔';
        result = true;
    }
    else if (isCorrectValue(value, 20.5)) {
        playSound('kuku');
        resultElement.innerText = '😭';
    }
    else {
        playSound('gomennasai');
        resultElement.innerText = '✘';
    }
    resultElement.className = 'result block';

    sleep(2000).then(() => {
        resultElement.className = 'result hidden';
        if (result) window.location.href = tohref;
    });
}

function animateSlider(container, slider, duration, flag) {
    let startValue = parseFloat(slider.value);
    let startTime = null;

    function animationFrame(time) {
        if (!startTime) startTime = time;
        const rawProgress = Math.min((time - startTime) / duration, 1);
        const easedProgress = easeInOut(rawProgress, 2);

        slider.value = startValue + (0 - startValue) * easedProgress;
        if (rawProgress < 1) {
            requestAnimationFrame(animationFrame);

        } else {
            slider.value = 0;
        }

        flag.style.left = `calc(${slider.value / 100} * (100% - ${flag.offsetWidth}px))`;
    }

    sleep(2000).then(() => {
        requestAnimationFrame(animationFrame);
    });
}

Array.from(document.getElementsByClassName('saki-container')).forEach(container => {
    let flag = container.querySelector('.flag');
    let slider = container.querySelector('.slider');

    var lastValue;
    var lastDirection;

    function downEvent() {
        playSound('saki');

        lastValue = 0;
        lastDirection = null;
    }

    slider.addEventListener('mousedown', downEvent);
    slider.addEventListener('touchstart',downEvent);

    slider.addEventListener('input', () => {
        let direction = slider.value - lastValue >= 0 ? 'right' : 'left';
        if (lastDirection != direction) {
            playSound('idou');
        }

        flag.style.left = `calc(${slider.value / 100} * (100% - ${flag.offsetWidth}px))`;

        lastDirection = direction;
        lastValue = slider.value;
    });

    function upEvent() {
        displayResult(container, slider.value);
        animateSlider(container, slider, 500, flag);
    }

    slider.addEventListener('mouseup',upEvent)
    slider.addEventListener('touchend',upEvent)
});