var animatePropIcon = document.getElementById('animateProperty');
var animateTranIcon = document.getElementById('animateTransform');
var animateMotIcon = document.getElementById('animateMotion');
var timelineIcon = document.getElementById('viewTimeline');
var minSeconds = 0;
var maxSeconds = 10;
var framesArray = [];
var defaultFPS = 10;

var vidMethod = true;

const getAnimations = (scene) => { return Array.from(svg.getElementsByClassName('animation')).filter((x) => { return parseInt(x.getAttribute('scene')) == scene }); }

const framesGenerator = (animations, fps, noAppend = true, callback = () => {}) => {
    if (noAppend) { framesArray = []; }
    var initialLength = framesArray.length;
    var deltaTime = Math.max(1 / fps, 0.005);
    var noOfFrames = Math.floor((maxSeconds - minSeconds) * fps);

    var tempTime = svg.getCurrentTime();
    var maxTime = tempTime + maxSeconds;
    var minTime = tempTime + minSeconds;

    animations.forEach((x) => {
        x.setAttribute('begin', `${tempTime+parseFloat(x.getAttribute('start'))}s`);
    });

    const getFrame = () => {
        svg.setCurrentTime(minTime);
        svg.pauseAnimations();
        var fileReader = new FileReader();
        fileReader.readAsDataURL(svgImg('png'));
        fileReader.onloadend = (event) => {
            framesArray.push(event.target.result);
            minTime += deltaTime;
            if (framesArray.length == initialLength + noOfFrames || minTime >= maxTime) {
                callback();
            } else {
                getFrame();
            };
            // };
        };
    };

    getFrame();
};

const timeLine = () => {
    removeById('timeline');
    removeById('objIn');
    stopAllAnimations();
    var timeLineDiv = document.createElement('div');
    timeLineDiv.id = 'timeline';
    document.body.append(timeLineDiv);

    var sliderPlay;
    var paused = true;
    var pauseTime = 0;
    // var animPlay = [];
    timeLineDiv.addEventListener('wheel', (evt) => {
        maxSeconds += evt.deltaY / 1000;
        maxSeconds = maxSeconds < minSeconds + 1 ? minSeconds + 1 : maxSeconds;
        if (evt.shiftKey) {
            minSeconds += evt.deltaY / 1000;
            minSeconds = minSeconds < 0 ? 0 : minSeconds;
            if (evt.altKey) {
                minSeconds = Math.round(minSeconds);
            };
        };
        if (evt.altKey) {
            maxSeconds = Math.max(Math.round(maxSeconds), minSeconds + 1);
        };
        timeLine();
    });

    var mediaTools = document.createElement('div');
    var propAnims = document.createElement('div');
    var transAnims = document.createElement('div');
    var motAnims = document.createElement('div');

    var slider = document.createElement('div');
    slider.style = "position:absolute; top:25%; left:0%; width:1px; height:75%; background: rgb(150,150,150);transition:all 0s;";
    slider.style.left = `0%`;
    mediaTools.append(slider);
    slider.id = 'animSlider';

    var animations = getAnimations(activeScene);

    animations.forEach((animation) => {
        if (!animation.getAttribute('handleColor')) {
            var randTimeColor = Math.round(Math.random() * 255);
            var randCheck = Math.random();
            if (randCheck < 0.3) {
                randTimeColor = `rgb(${randTimeColor},120,120)`;
            } else if (randCheck < 0.7) {
                randTimeColor = `rgb(120,${randTimeColor},120)`;
            } else {
                randTimeColor = `rgb(120,120,${randTimeColor})`;
            };
            animation.setAttribute('handleColor', randTimeColor);
        };
    });

    animations.forEach((animation) => {
        var beginTime = parseFloat(animation.getAttribute('start'));
        var endTime = beginTime + parseFloat(animation.getAttribute('dur'));
        var keyTimes = animation.getAttribute('keyTimes').split(';');
        var valStr = animation.tagName == 'animateMotion' ? 'keyPoints' : 'values';
        var values = animation.getAttribute(valStr).split(';');
        var keySplines = animation.getAttribute('keySplines').split(';');
        keySplines.forEach((keySpline) => {
            keySplines[keySplines.indexOf(keySpline)] = keySpline.split(' ');
        });

        var animHandle = document.createElement('div');
        animHandle.style.position = 'absolute';
        animHandle.style.width = `${((endTime-beginTime)/(maxSeconds-minSeconds))*100}%`;
        animHandle.style.height = '13%';
        animHandle.style.left = `${((beginTime-minSeconds)/(maxSeconds-minSeconds))*100}%`;
        animHandle.style.border = '1px solid rgb(200,200,200)';
        animHandle.style.borderRadius = '8px';
        animHandle.style.background = 'rgba(230,230,230,0.5)';
        animHandle.style.cursor = 'pointer';

        if (animation.tagName == 'animate') {
            animHandle.style.top = '31%';
            propAnims.append(animHandle);
        } else if (animation.tagName == 'animateTransform') {
            animHandle.style.top = '56%';
            transAnims.append(animHandle);
        } else {
            animHandle.style.top = '81%';
            motAnims.append(animHandle);
        };

        const splineEditorFx = () => {
            removeById('animValueInput');
            removeById('animSplineEditor');
            var movingTangent = null;
            var movingSplineIndex = null;
            var animSplineEditor = document.createElement('div');
            animSplineEditor.id = 'animSplineEditor';
            animSplineEditor.style = `position:absolute; bottom:20%; height:50%; width:25%; left:37.5%; border:1px solid rgb(220,220,220); border-radius:12px; background:white`;
            document.body.append(animSplineEditor);
            var animSplineSvg = document.createElementNS(ns, 'svg');
            animSplineSvg.setAttribute('viewBox', '-0.05 -0.05 1.1 1.1');
            animSplineSvg.setAttribute('transform', 'scale(1,-1)');
            animSplineSvg.style = 'position:absolute; width:90%; height:90%; top:5%; left:5%;'

            var gridBox = document.createElementNS(ns, 'g');
            for (i = 0; i <= 1; i += 0.1) {
                var gridLineX = document.createElementNS(ns, 'path');
                var gridLineY = document.createElementNS(ns, 'path');
                gridLineX.setAttribute('d', `M 0 ${i} L 1 ${i}`);
                gridLineY.setAttribute('d', `M ${i} 0 L ${i} 1`);
                gridLineX.style = gridLineY.style = 'fill:none; stroke:rgb(220,220,220); stroke-width:0.005';
                gridBox.append(gridLineX);
                gridBox.append(gridLineY);
            }

            animSplineSvg.append(gridBox);

            const drawAnimSpline = () => {
                removeById('animSpline');
                var animSpline = document.createElementNS(ns, 'path');
                animSpline.setAttribute('fill', 'none');
                animSpline.setAttribute('stroke', animation.getAttribute('handleColor'));
                animSpline.setAttribute('stroke-width', '0.01');
                animSplineSvg.append(animSpline);
                var splinePts = '';
                keySplines.forEach((x) => {
                    var t = keySplines.indexOf(x);
                    removeById(`tangHandl${t}1`);
                    removeById(`tangHandl${t}2`);
                    removeById(`tangLine${t}1`);
                    removeById(`tangLine${t}2`);
                    splinePts += `M ${keyTimes[t]} ${keyTimes[t]} C ${x.join(' ')} ${keyTimes[t+1]} ${keyTimes[t+1]}`;
                    var tangentHandle1 = document.createElementNS(ns, 'ellipse');
                    tangentHandle1.setAttribute('cx', x[0]);
                    tangentHandle1.setAttribute('cy', x[1]);
                    tangentHandle1.setAttribute('rx', '0.025');
                    tangentHandle1.setAttribute('stroke', 'none');
                    tangentHandle1.setAttribute('fill', animation.getAttribute('handleColor'));

                    var tangLine1 = document.createElementNS(ns, 'path');
                    tangLine1.setAttribute('stroke', animation.getAttribute('handleColor'));
                    tangLine1.setAttribute('fill', 'none');
                    tangLine1.setAttribute('opacity', '0.5');
                    tangLine1.setAttribute('stroke-width', '0.0125');
                    tangLine1.setAttribute('d', `M ${keyTimes[t]} ${keyTimes[t]} L ${x[0]} ${x[1]}`);
                    animSplineSvg.append(tangLine1);
                    animSplineSvg.append(tangentHandle1);

                    var tangentHandle2 = document.createElementNS(ns, 'ellipse');
                    tangentHandle2.setAttribute('cx', x[2]);
                    tangentHandle2.setAttribute('cy', x[3]);
                    tangentHandle2.setAttribute('rx', '0.025');
                    tangentHandle2.setAttribute('stroke', 'none');
                    tangentHandle2.setAttribute('fill', animation.getAttribute('handleColor'));

                    var tangLine2 = document.createElementNS(ns, 'path');
                    tangLine2.setAttribute('stroke', animation.getAttribute('handleColor'));
                    tangLine2.setAttribute('fill', 'none');
                    tangLine2.setAttribute('opacity', '0.5');
                    tangLine2.setAttribute('stroke-width', '0.0125');
                    tangLine2.setAttribute('d', `M ${keyTimes[t+1]} ${keyTimes[t+1]} L ${x[2]} ${x[3]}`);
                    animSplineSvg.append(tangLine2);
                    animSplineSvg.append(tangentHandle2);

                    tangentHandle1.style.cursor = tangentHandle2.style.cursor = 'pointer';
                    tangentHandle1.id = `tangHandl${t}1`;
                    tangentHandle2.id = `tangHandl${t}2`;
                    tangLine1.id = `tangLine${t}1`;
                    tangLine2.id = `tangLine${t}2`
                });
                animSpline.setAttribute('d', splinePts);
                animSpline.id = 'animSpline';
                animSpline.style.cursor = 'pointer';
            }
            drawAnimSpline();

            animSplineSvg.addEventListener('mousedown', (evt) => {
                if (evt.target.id.slice(0, 9) == 'tangHandl') {
                    movingTangent = evt.target.id.charAt(evt.target.id.length - 1);
                    movingSplineIndex = evt.target.id.slice(9, evt.target.id.length - 1);
                } else if (evt.target.id == 'animSpline') {
                    var gBox = gridBox.getBoundingClientRect();
                    var currX = (evt.x - gBox.x) / gBox.width;
                    currX = currX < 0 ? 0 : (currX > 1 ? 1 : currX);
                    for (i = 0; i < keyTimes.length - 1; i++) {
                        if (keyTimes[i] < currX && keyTimes[i + 1] > currX) {
                            keyTimes.splice(i + 1, 0, currX);
                            values.splice(i + 1, 0, values[i + 1]);
                            var kSplineAttr = animation.getAttribute('keySplines').split(';');
                            var tSpline = kSplineAttr[i].split(' ');
                            tSpline[2] = tSpline[3] = currX;
                            kSplineAttr.splice(i, 0, tSpline.join(' '));
                            tSpline = kSplineAttr[i + 1].split(' ');
                            tSpline[0] = tSpline[1] = currX;
                            kSplineAttr[i + 1] = tSpline.join(' ');
                            animation.setAttribute('keySplines', kSplineAttr.join(';'));
                            animation.setAttribute('keyTimes', keyTimes.join(';'));
                            animation.setAttribute('values', values.join(';'));
                            keySplines = animation.getAttribute('keySplines').split(';');
                            keySplines.forEach((keySpline) => {
                                keySplines[keySplines.indexOf(keySpline)] = keySpline.split(' ');
                            });
                            drawAnimSpline();
                            timeLine();
                        }
                    }
                }
            });

            animSplineSvg.addEventListener('mousemove', (evt) => {
                if (movingTangent != null) {
                    var gBox = gridBox.getBoundingClientRect();
                    var currX = (evt.x - gBox.x) / gBox.width;
                    var currY = 1 - (evt.y - gBox.y) / gBox.height;
                    currX = currX < 0 ? 0 : (currX > 1 ? 1 : currX);
                    currY = currY < 0 ? 0 : (currY > 1 ? 1 : currY);
                    var kSplineAttr = animation.getAttribute('keySplines').split(';');
                    t = movingSplineIndex;
                    if (movingTangent == 1) {
                        kSplineAttr[t] = `${currX} ${currY} ${keySplines[t][2]} ${keySplines[t][3]}`;
                    } else {
                        kSplineAttr[t] = `${keySplines[t][0]} ${keySplines[t][1]} ${currX} ${currY}`;
                    };
                    animation.setAttribute('keySplines', kSplineAttr.join(';'));
                    keySplines = animation.getAttribute('keySplines').split(';');
                    keySplines.forEach((keySpline) => {
                        keySplines[keySplines.indexOf(keySpline)] = keySpline.split(' ');
                    });
                    drawAnimSpline();
                };
            });

            animSplineSvg.addEventListener('mouseup', () => {
                movingTangent = null;
            });

            animSplineEditor.append(animSplineSvg);
        }
        animHandle.addEventListener('click', (evt) => {
            if (evt.shiftKey) {
                splineEditorFx();
            } else if (evt.target == animHandle) {
                if (evt.ctrlKey) {
                    animation.remove();
                    removeById('animValueInput');
                    removeById('animSplineEditor');
                    timeLine();
                } else if (evt.altKey) {
                    animHandle.parentNode.prepend(animHandle);
                } else {
                    animHandle.parentNode.append(animHandle);
                };
                removeById('animValueInput');
                removeById('animSplineEditor');
            };
        });
        animHandle.addEventListener('mouseenter', () => {
            drawBoundingBox(document.getElementById(animation.getAttribute('href').slice(1)));
            var atrLab = document.createElement('i');
            atrLab.innerText = animation.tagName == 'animate' ? animation.getAttribute('attributeName') : (animation.tagName == 'animateTransform' ? animation.getAttribute('type') : animation.childNodes[0].getAttribute('href'));
            atrLab.id = 'atrLab';
            atrLab.style = 'margin:0; font-size:14px;'
            animHandle.prepend(atrLab);
        });
        animHandle.addEventListener('mouseleave', () => {
            removeById('boundingBox');
            removeById('atrLab');
        });
        keyTimes.forEach((keyTime) => {
            var timeHandle = document.createElement('div');
            timeHandle.style = 'position:absolute; top: calc(50% - 6px); width:12px; height:12px; border:rgb(100,100,100); border-radius:6px; cursor:pointer';
            timeHandle.style.background = animation.getAttribute('handleColor');
            timeHandle.style.left = `calc(${parseFloat(keyTime)} * (100% - 12px)`;
            animHandle.append(timeHandle);
            timeHandle.addEventListener('click', (evt) => {
                if (evt.ctrlKey && keyTimes.length > 2) {
                    var index = keyTimes.indexOf(keyTime);
                    if (index > 0 && index < keyTimes.length - 1) {
                        keyTimes.splice(index, 1);
                        values.splice(index, 1);
                        var tSpline1 = keySplines[index - 1];
                        var tSpline2 = keySplines[index];
                        keySplines[index] = [tSpline1[0], tSpline1[1], tSpline2[2], tSpline2[3]];
                        keySplines.splice(index, 1);
                        animation.setAttribute('values', values.join('; '));
                        animation.setAttribute('keyTimes', keyTimes.join('; '));
                        animation.setAttribute('keySplines', keySplines.join('; ').replaceAll(',', ' '));
                        timeLine();
                    };
                };
                removeById('animValueInput');
                removeById('animSplineEditor');
                var valueInput = document.createElement('input');
                valueInput.id = 'animValueInput'
                valueInput.style = 'position:absolute; bottom:100%; width: 150px; height: 14px; font-size: 12px; outline:none';
                valueInput.style.left = `calc(${parseFloat(keyTime)} * (100% - 150px)`;
                valueInput.value = values[keyTimes.indexOf(keyTime)];
                valueInput.oninput = () => {
                    values[keyTimes.indexOf(keyTime)] = valueInput.value;
                    animation.setAttribute(valStr, values.join('; '));
                };
                animHandle.append(valueInput);
            });
        });
    });

    var playPauseBtn = document.createElement('button');
    playPauseBtn.innerHTML = '&#9654';
    playPauseBtn.style = "position:absolute; left:calc(50% - 25px); font-size:14px; width:24px; margin:0; margin-top:0.125%; border:1px solid rgb(120,120,120)";
    mediaTools.append(playPauseBtn);
    playPauseBtn.setAttribute('id', 'playPauseButton');
    playPauseBtn.addEventListener('click', () => {
        if (!paused) {
            // pauseTime = minSeconds + parseFloat(slider.style.left) * (maxSeconds - minSeconds) / 100;
            playPauseBtn.innerHTML = '&#9654';
            clearInterval(sliderPlay);
            // animPlay.forEach((x) => { clearTimeout(x) });
            svg.pauseAnimations();
            paused = true;
        } else {
            playPauseBtn.innerHTML = '&#8214';
            svg.unpauseAnimations();
            paused = false;
            // animPlay.forEach((x) => { clearTimeout(x) });
            sliderPlay = setInterval(() => {
                var currLeft = parseFloat(slider.style.left);
                if (currLeft >= 100) {
                    clearInterval(sliderPlay);
                    // slider.style.left = `-${100*minSeconds/(maxSeconds-minSeconds)}%`;
                    // currLeft = -100 * minSeconds / (maxSeconds - minSeconds);
                    slider.style.left = `0%`;
                    currLeft = 0;
                    stopBtn.click();
                    pauseTime = 0;
                } else {
                    slider.style.left = `${currLeft + 1/(maxSeconds-minSeconds)}%`;
                    pauseTime += 0.01;
                }
            }, 10);
            var startTime = svg.getCurrentTime();
            animations.forEach((x) => {
                x.setAttribute('begin', `${0.0001+startTime+parseFloat(x.getAttribute('start')) - pauseTime}s`);
                // if (animTime >= 0) { animPlay.push(setTimeout(() => { x.beginElement(); }, animTime * 1000)) };
            });
            svg.setCurrentTime(startTime + minSeconds);
        }
    });
    addToolTip(playPauseBtn, 'Play | Pause', 'top');

    var stopBtn = document.createElement('button');
    stopBtn.innerHTML = '&#9724';
    stopBtn.style = "position:absolute; left:calc(50% + 1px); font-size:14px; width:24px; margin:0; margin-top:0.125%; border:1px solid rgb(120,120,120)";
    mediaTools.append(stopBtn);
    stopBtn.setAttribute('id', 'animationStopButton');
    stopBtn.addEventListener('click', () => {
        if (!paused) { playPauseBtn.click(); };
        clearInterval(sliderPlay);
        // slider.style.left = `-${100*minSeconds/(maxSeconds-minSeconds)}%`;
        // currLeft = -100 * minSeconds / (maxSeconds - minSeconds);
        slider.style.left = '0%';
        currLeft = 0;
        stopAllAnimations();
        paused = true;
        pauseTime = 0;
    });
    addToolTip(stopBtn, 'Stop', 'top');

    var exportFrameBtn = document.createElement('button');
    exportFrameBtn.innerHTML = 'Frames';
    exportFrameBtn.style = "position:absolute; font-size:12px; margin:0; right:74px; margin-top:0.125%; border:1px solid rgb(120,120,120)";
    mediaTools.append(exportFrameBtn);
    exportFrameBtn.setAttribute('id', 'exportFrameButton');
    exportFrameBtn.addEventListener('click', (event) => {
        stopBtn.click();
        removeById('objIn');

        var exportFrameDB = document.createElement('div');
        exportFrameDB.id = 'objIn';
        exportFrameDB.style.left = `${event.clientX}px`;
        exportFrameDB.style.bottom = `${100-parseFloat(timeLineDiv.style.top)||20}%`;

        var widthIn = document.createElement('div');
        widthIn.setAttribute('contentEditable', 'true');
        widthIn.id = 'typeIn';

        var heightIn = document.createElement('div');
        heightIn.setAttribute('contentEditable', 'true');
        heightIn.id = 'typeIn';

        var fpsIn = document.createElement('div');
        fpsIn.setAttribute('contentEditable', 'true');
        fpsIn.id = 'typeIn';

        var isAppendDiv = document.createElement('div');
        isAppendDiv.style = 'margin:8px; display:flex';
        var isAppend = document.createElement('input');
        isAppend.setAttribute('type', 'checkbox');
        isAppend.id = 'isAppend';
        isAppend.style = 'margin:0 4px;';
        var lab = document.createElement('p');
        lab.innerText = 'Append';
        lab.style = 'margin:0;';
        isAppendDiv.append(isAppend);
        isAppendDiv.append(lab);

        exportFrameDB.append(document.createTextNode('Width'));
        exportFrameDB.append(widthIn);
        widthIn.innerText = defaultImgWidth;
        exportFrameDB.append(document.createTextNode('Height'));
        exportFrameDB.append(heightIn);
        heightIn.innerText = defaultImgHeight;
        exportFrameDB.append(document.createTextNode('FPS'));
        exportFrameDB.append(fpsIn);
        fpsIn.innerText = defaultFPS;
        exportFrameDB.append(isAppendDiv);

        var okButton = document.createElement('button');
        okButton.innerText = 'OK';
        exportFrameDB.append(okButton);
        document.body.append(exportFrameDB);

        okButton.addEventListener('click', () => {
            removeById('objIn');
            defaultFPS = parseFloat(fpsIn.innerText) || defaultFPS;
            defaultFPS = Math.max(0, defaultFPS);
            defaultImgHeight = parseFloat(heightIn.innerText) || defaultImgHeight;
            defaultImgWidth = parseFloat(widthIn.innerText) || defaultImgWidth;
            framesGenerator(animations, defaultFPS, !isAppend.checked, () => { openFrameWindow(`FRAMES [${defaultImgWidth} x ${defaultImgHeight} @ ${defaultFPS}]`); });
        });
    });

    var exportVideoBtn = document.createElement('button');
    exportVideoBtn.innerHTML = 'Video';
    exportVideoBtn.style = "position:absolute; font-size:12px; margin:0; right:28px; margin-top:0.125%; border:1px solid rgb(120,120,120)";
    mediaTools.append(exportVideoBtn);
    exportVideoBtn.setAttribute('id', 'exportVideoButton');
    exportVideoBtn.addEventListener('click', () => {
        if (framesArray.length > 0) {
            vidMethod ? ffmpegEncodedVideo(framesArray, defaultImgWidth, defaultImgHeight, defaultFPS) : canvasRecordedVideo(framesArray, defaultImgWidth, defaultImgHeight, defaultFPS);
        };
    });

    var minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '&#8659';
    minimizeButton.style = "position:absolute;font-size:14px; width:24px; margin:0;right:0.125%;margin-top:0.125%;border:1px solid rgb(120,120,120)";
    mediaTools.append(minimizeButton);
    minimizeButton.setAttribute('id', 'minimizeButton');
    minimizeButton.addEventListener('click', () => {
        if (timeLineDiv.style.top == '90%') {
            minimizeButton.innerHTML = '&#8659';
            timeLineDiv.style.top = '80%';
        } else {
            minimizeButton.innerHTML = '&#8657';
            timeLineDiv.style = 'top:90%';
        }
    })
    addToolTip(minimizeButton, 'Minimize | Maximize', 'top');

    var timeSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    timeSteps.forEach((i) => {
        var timeIndicator = document.createElement('div');
        timeIndicator.style = "position:absolute; top:16%; height:14px; font-size: 12px; color: rgb(150,150,150); user-select:none";
        i < 100 ? timeIndicator.style.left = `${i}%` : timeIndicator.style.right = '0%';
        var seconds = Math.round((minSeconds + i * (maxSeconds - minSeconds) / 100) * 1000) / 1000;
        var timeString = `${seconds}s`;
        if (seconds >= 60) {
            var msString = `${Math.round((seconds - Math.round(seconds))*1000)}`;
            var secondString = `${Math.round(seconds)%60}`;
            var minuteString = `${Math.floor(seconds/60)}`;
            if (parseFloat(msString) > 0) {
                timeString = `${minuteString}m${secondString}.${msString}s`;
            } else if (parseFloat(secondString) > 0) {
                timeString = `${minuteString}m${secondString}s`;
            } else {
                timeString = `${minuteString}m`;
            }
        };
        timeIndicator.innerText = timeString;
        mediaTools.append(timeIndicator);
    });

    mediaTools.style.height = propAnims.style.height = transAnims.style.height = motAnims.style.height = '25%';
    propAnims.style.borderTop = transAnims.style.borderTop = motAnims.style.borderTop = '1px solid rgb(110,110,110)';
    timeLineDiv.append(mediaTools);
    timeLineDiv.append(propAnims);
    timeLineDiv.append(transAnims);
    timeLineDiv.append(motAnims);
};

const stopAllAnimations = () => {
    svg.unpauseAnimations();
    Array.from(svg.getElementsByClassName('animation')).forEach((x) => {
        x.endElement();
        x.setAttribute('begin', 'indefinite');
    });
};

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        removeById('timeline');
        removeById('animSplineEditor');
        stopAllAnimations();
    };
});

timelineIcon.addEventListener('click', () => {
    // activeTool = 'timeLine';
    timeLine();
});

animatePropIcon.addEventListener('click', (event) => {
    activeTool = 'animate';
    openAnimPropDB(event);
});

animateTranIcon.addEventListener('click', (event) => {
    activeTool = 'animate';
    openAnimTranDB(event);
});

animateMotIcon.addEventListener('click', (event) => {
    activeTool = 'animate';
    openAnimMotDB(event);
});

const openAnimPropDB = (event) => {
    removeById('editTable');
    removeById('boundingBox');
    var objects = Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) == activeScene });
    var animPropDB = document.createElement('div');
    animPropDB.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; max-height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    animPropDB.setAttribute('id', 'editTable');
    var objDropDown = document.createElement('div');
    objDropDown.style.fontSize = '14px';
    objDropDown.style.padding = '2px';
    objects.forEach((object) => {
        if (['defs', 'animate', 'animateMotion', 'animateTransform'].indexOf(object.tagName) == -1 && ['majorGrid', 'minorGrid', 'boundingBox', 'tempObj'].indexOf(object.id) == -1) {
            var option = document.createElement('p');
            option.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
            option.addEventListener('mouseenter', () => {
                option.style.background = 'rgb(90,90,90)';
                option.style.color = 'white';
                drawBoundingBox(object);
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
                option.style.color = 'black';
                removeById('boundingBox');
            });
            option.addEventListener('click', () => {
                // animatedObj = object;
                Array.from(document.getElementsByClassName('animPropOption')).forEach((x) => { x.remove() });
                var attrNames = object.getAttributeNames();
                attrNames.forEach((atrNam) => {
                    if (['transform', 'style', 'class', 'href', 'id', 'scene'].indexOf(atrNam) == -1) {
                        var attrOption = document.createElement('p');
                        attrOption.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
                        attrOption.addEventListener('mouseenter', () => {
                            attrOption.style.background = 'rgb(90,90,90)';
                            attrOption.style.color = 'white';
                        });
                        attrOption.addEventListener('mouseleave', () => {
                            attrOption.style.background = 'white';
                            attrOption.style.color = 'black';
                        });
                        attrOption.addEventListener('click', () => {
                            Array.from(document.getElementsByClassName('attrAnimOption')).forEach((x) => { x.remove() });
                            var fromInput = document.createElement('p');
                            fromInput.innerHTML = 'Start @';
                            fromInput.style.margin = '0';
                            fromTimeInput = document.createElement('input');
                            fromTimeInput.setAttribute('type', 'number');
                            fromTimeInput.setAttribute('min', '0');
                            fromTimeInput.style.width = '50%';
                            fromTimeInput.style.outline = 'none';
                            var toInput = document.createElement('p');
                            toInput.innerHTML = 'End @';
                            toInput.style.margin = '0';
                            toTimeInput = document.createElement('input');
                            toTimeInput.setAttribute('type', 'number');
                            fromTimeInput.setAttribute('min', '0');
                            toTimeInput.style.width = '50%';
                            toTimeInput.style.outline = 'none';
                            objDropDown.append(fromInput);
                            objDropDown.append(fromTimeInput);
                            objDropDown.append(toInput);
                            objDropDown.append(toTimeInput);
                            var addBtn = document.createElement('button');
                            addBtn.innerHTML = 'ADD';
                            objDropDown.append(document.createElement('hr'));
                            objDropDown.append(addBtn);
                            addBtn.style.marginLeft = '0';
                            addBtn.addEventListener('click', () => {
                                if (fromTimeInput.value.length > 0 && toTimeInput.value.length > 0) {
                                    var animObj = document.createElementNS(ns, 'animate');
                                    var elemName = object.id;
                                    elemName = elemName ? elemName : `animObj${Math.round(Math.random()*10000)}`;
                                    object.id = elemName;
                                    animObj.setAttribute('href', `#${elemName}`);
                                    animObj.setAttribute('attributeName', atrNam);
                                    animObj.setAttribute('begin', 'indefinite');
                                    var fromAnim = parseFloat(fromTimeInput.value);
                                    fromAnim = fromAnim >= 0 ? fromAnim : 0;
                                    animObj.setAttribute('start', `${fromAnim}`);
                                    var durAnim = parseFloat(toTimeInput.value) - fromAnim;
                                    animObj.setAttribute('dur', `${durAnim > 0? durAnim : 1}s`);
                                    animObj.setAttribute('values', `${object.getAttribute(atrNam)}; ${object.getAttribute(atrNam)}`);
                                    animObj.setAttribute('keyTimes', '0; 1');
                                    animObj.setAttribute('keySplines', '0 0 1 1');
                                    animObj.setAttribute('calcMode', 'spline');
                                    animObj.setAttribute('fill', 'remove');
                                    animObj.setAttribute('class', 'animation');
                                    animObj.setAttribute('scene', activeScene);
                                    svg.append(animObj);
                                    timeLine();
                                };
                            });
                        });
                        attrOption.innerText = atrNam;
                        attrOption.setAttribute('class', 'attrAnimOption');
                        objDropDown.append(attrOption);
                    };
                });
            });
            option.innerText = object.tagName;
            option.setAttribute('class', 'animPropOption');
            objDropDown.append(option);
        };
    });
    animPropDB.append(objDropDown);
    if (objDropDown.childNodes.length > 0) {
        document.body.append(animPropDB);
    };
};

const openAnimTranDB = (event) => {
    removeById('editTable');
    removeById('boundingBox');
    var objects = Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) == activeScene });
    var animTranDB = document.createElement('div');
    animTranDB.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; max-height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    animTranDB.setAttribute('id', 'editTable');
    var objDropDown = document.createElement('div');
    objDropDown.style.fontSize = '14px';
    objDropDown.style.padding = '2px';
    objects.forEach((object) => {
        if (['defs', 'animate', 'animateMotion', 'animateTransform'].indexOf(object.tagName) == -1 && ['majorGrid', 'minorGrid', 'boundingBox', 'tempObj'].indexOf(object.id) == -1) {
            var defaultValue = (atrNam) => {
                if (object.getAttributeNames().indexOf(atrNam) != -1) {
                    return object.getAttribute(atrNam);
                } else {
                    if (object.getAttributeNames().indexOf('transform') != -1) {
                        var matches = [...transform.matchAll(`/${atrNam}\(.*\)/g`)];
                        if (matches.length != 0) {
                            var match = matches[0];
                            return match.substring(atrNam.length + 1, match.length - 1).replaceAll(',', ' ');
                        }
                    }
                    if (atrNam == 'translate') { return '0 0' } else if (atrNam == 'rotate') { return '0 0 0' } else if (atrNam == 'scale') { return '1 1' } else { return '0' };
                }
            };
            var option = document.createElement('p');
            option.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
            option.addEventListener('mouseenter', () => {
                option.style.background = 'rgb(90,90,90)';
                option.style.color = 'white';
                drawBoundingBox(object);
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
                option.style.color = 'black';
                removeById('boundingBox');
            });
            option.addEventListener('click', () => {
                // animatedObj = object;
                Array.from(document.getElementsByClassName('animTranOption')).forEach((x) => { x.remove() });
                var attrNames = ['translate', 'rotate', 'scale', 'skewX', 'skewY'];
                attrNames.forEach((atrNam) => {
                    var attrOption = document.createElement('p');
                    attrOption.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
                    attrOption.addEventListener('mouseenter', () => {
                        attrOption.style.background = 'rgb(90,90,90)';
                        attrOption.style.color = 'white';
                    });
                    attrOption.addEventListener('mouseleave', () => {
                        attrOption.style.background = 'white';
                        attrOption.style.color = 'black';
                    });
                    attrOption.addEventListener('click', () => {
                        Array.from(document.getElementsByClassName('attrAnimOption')).forEach((x) => { x.remove() });
                        var fromInput = document.createElement('p');
                        fromInput.innerHTML = 'Start @';
                        fromInput.style.margin = '0';
                        fromTimeInput = document.createElement('input');
                        fromTimeInput.setAttribute('type', 'number');
                        fromTimeInput.setAttribute('min', '0');
                        fromTimeInput.style.width = '50%';
                        fromTimeInput.style.outline = 'none';
                        var toInput = document.createElement('p');
                        toInput.innerHTML = 'End @';
                        toInput.style.margin = '0';
                        toTimeInput = document.createElement('input');
                        toTimeInput.setAttribute('type', 'number');
                        fromTimeInput.setAttribute('min', '0');
                        toTimeInput.style.width = '50%';
                        toTimeInput.style.outline = 'none';
                        objDropDown.append(fromInput);
                        objDropDown.append(fromTimeInput);
                        objDropDown.append(toInput);
                        objDropDown.append(toTimeInput);
                        var addBtn = document.createElement('button');
                        addBtn.innerHTML = 'ADD';
                        objDropDown.append(document.createElement('hr'));
                        objDropDown.append(addBtn);
                        addBtn.style.marginLeft = '0';
                        addBtn.addEventListener('click', () => {
                            if (fromTimeInput.value.length > 0 && toTimeInput.value.length > 0) {
                                var animObj = document.createElementNS(ns, 'animateTransform');
                                var elemName = object.id;
                                elemName = elemName ? elemName : `animObj${Math.round(Math.random()*10000)}`;
                                object.id = elemName;
                                animObj.setAttribute('href', `#${elemName}`);
                                animObj.setAttribute('attributeName', 'transform');
                                animObj.setAttribute('type', atrNam);
                                animObj.setAttribute('begin', 'indefinite');
                                var fromAnim = parseFloat(fromTimeInput.value);
                                fromAnim = fromAnim >= 0 ? fromAnim : 0;
                                animObj.setAttribute('start', `${fromAnim}`);
                                var durAnim = parseFloat(toTimeInput.value) - fromAnim;
                                animObj.setAttribute('dur', `${durAnim > 0? durAnim : 1}s`);
                                animObj.setAttribute('values', `${defaultValue(atrNam)}; ${defaultValue(atrNam)}`);
                                animObj.setAttribute('keyTimes', '0; 1');
                                animObj.setAttribute('keySplines', '0 0 1 1');
                                animObj.setAttribute('calcMode', 'spline');
                                animObj.setAttribute('fill', 'remove');
                                animObj.setAttribute('class', 'animation');
                                animObj.setAttribute('scene', activeScene);
                                svg.append(animObj);
                                timeLine();
                            };
                        });
                    });
                    attrOption.innerText = atrNam;
                    attrOption.setAttribute('class', 'attrAnimOption');
                    objDropDown.append(attrOption);
                });
            });
            option.innerText = object.tagName;
            option.setAttribute('class', 'animTranOption');
            objDropDown.append(option);
        };
    });
    animTranDB.append(objDropDown);
    if (objDropDown.childNodes.length > 0) {
        document.body.append(animTranDB);
    };
};

const openAnimMotDB = (event) => {
    removeById('editTable');
    removeById('boundingBox');
    var objects = Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) == activeScene });
    var paths = Array.from(svg.getElementsByTagNameNS(ns, 'path'));
    var animMotDB = document.createElement('div');
    animMotDB.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; max-height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    animMotDB.setAttribute('id', 'editTable');
    var objDropDown = document.createElement('div');
    objDropDown.style.fontSize = '14px';
    objDropDown.style.padding = '2px';
    objects.forEach((object) => {
        if (['defs', 'animate', 'animateMotion', 'animateTransform'].indexOf(object.tagName) == -1 && ['majorGrid', 'minorGrid', 'boundingBox', 'tempObj'].indexOf(object.id) == -1) {
            var option = document.createElement('p');
            option.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
            option.addEventListener('mouseenter', () => {
                option.style.background = 'rgb(90,90,90)';
                option.style.color = 'white';
                drawBoundingBox(object);
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
                option.style.color = 'black';
                removeById('boundingBox');
            });
            option.addEventListener('click', () => {
                // animatedObj = object;
                Array.from(document.getElementsByClassName('animMotOption')).forEach((x) => { x.remove() });
                paths.forEach((path) => {
                    if (path.id == '') {
                        path.id = `animPath${Math.round(Math.random()*1000)}`;
                    }
                    var pathOption = document.createElement('p');
                    pathOption.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
                    pathOption.addEventListener('mouseenter', () => {
                        pathOption.style.background = 'rgb(90,90,90)';
                        pathOption.style.color = 'white';
                        drawBoundingBox(path);
                    });
                    pathOption.addEventListener('mouseleave', () => {
                        pathOption.style.background = 'white';
                        pathOption.style.color = 'black';
                        removeById('boundingBox');
                    });
                    pathOption.addEventListener('click', () => {
                        Array.from(document.getElementsByClassName('pathAnimOption')).forEach((x) => { x.remove() });
                        var fromInput = document.createElement('p');
                        fromInput.innerHTML = 'Start @';
                        fromInput.style.margin = '0';
                        fromTimeInput = document.createElement('input');
                        fromTimeInput.setAttribute('type', 'number');
                        fromTimeInput.setAttribute('min', '0');
                        fromTimeInput.style.width = '50%';
                        fromTimeInput.style.outline = 'none';
                        var toInput = document.createElement('p');
                        toInput.innerHTML = 'End @';
                        toInput.style.margin = '0';
                        toTimeInput = document.createElement('input');
                        toTimeInput.setAttribute('type', 'number');
                        fromTimeInput.setAttribute('min', '0');
                        toTimeInput.style.width = '50%';
                        toTimeInput.style.outline = 'none';
                        objDropDown.append(fromInput);
                        objDropDown.append(fromTimeInput);
                        objDropDown.append(toInput);
                        objDropDown.append(toTimeInput);
                        var addBtn = document.createElement('button');
                        addBtn.innerHTML = 'ADD';
                        objDropDown.append(document.createElement('hr'));
                        objDropDown.append(addBtn);
                        addBtn.style.marginLeft = '0';
                        addBtn.addEventListener('click', () => {
                            if (fromTimeInput.value.length > 0 && toTimeInput.value.length > 0) {
                                var animObj = document.createElementNS(ns, 'animateMotion');
                                var elemName = object.id;
                                elemName = elemName ? elemName : `animObj${Math.round(Math.random()*10000)}`;
                                object.id = elemName;
                                animObj.setAttribute('href', `#${elemName}`);
                                // animObj.setAttribute('attributeName', 'transform');
                                // animObj.setAttribute('type', atrNam);
                                animObj.setAttribute('begin', 'indefinite');
                                var fromAnim = parseFloat(fromTimeInput.value);
                                fromAnim = fromAnim >= 0 ? fromAnim : 0;
                                animObj.setAttribute('start', `${fromAnim}`);
                                var durAnim = parseFloat(toTimeInput.value) - fromAnim;
                                animObj.setAttribute('dur', `${durAnim > 0? durAnim : 1}s`);
                                animObj.setAttribute('keyPoints', '0; 1');
                                animObj.setAttribute('keyTimes', '0; 1');
                                animObj.setAttribute('keySplines', '0 0 1 1');
                                animObj.setAttribute('calcMode', 'spline');
                                animObj.setAttribute('fill', 'remove');
                                animObj.setAttribute('rotate', 'auto');
                                animObj.setAttribute('class', 'animation');
                                animObj.setAttribute('scene', activeScene);
                                svg.append(animObj);
                                var tempMpath = document.createElementNS(ns, 'mpath');
                                tempMpath.setAttribute('href', `#${path.id}`);
                                animObj.append(tempMpath);
                                timeLine();
                            };
                        });
                    });
                    pathOption.innerText = path.id;
                    pathOption.setAttribute('class', 'pathAnimOption');
                    objDropDown.append(pathOption);
                });
            });
            option.innerText = object.tagName;
            option.setAttribute('class', 'animMotOption');
            objDropDown.append(option);
        };
    });
    animMotDB.append(objDropDown);
    if (objDropDown.childNodes.length > 0) {
        document.body.append(animMotDB);
    };
};

document.getElementById('exportVideo').addEventListener('click', () => {
    framesArray = [];
    const callbackFx = (i) => {
        changeScene(i);
        var anims = getAnimations(i);
        minSeconds = 0;
        maxSeconds = 1 / defaultFPS;
        anims.forEach((anim) => {
            maxSeconds = Math.max(maxSeconds, parseFloat(anim.getAttribute('start')) + parseFloat(anim.getAttribute('dur')));
        });
        if (i < maxScene) {
            framesGenerator(anims, defaultFPS, false, () => { callbackFx(i + 1) });
        } else {
            framesGenerator(anims, defaultFPS, false, () => {
                if (vidMethod) {
                    openFrameWindow(`FRAMES [${defaultImgWidth} x ${defaultImgHeight} @ ${defaultFPS}]`);
                    ffmpegEncodedVideo(framesArray, defaultImgWidth, defaultImgHeight, defaultFPS);
                } else {
                    canvasRecordedVideo(framesArray, defaultImgWidth, defaultImgHeight, defaultFPS);
                    openFrameWindow(`FRAMES [${defaultImgWidth} x ${defaultImgHeight} @ ${defaultFPS}]`);
                };
            });
        };
    };
    callbackFx(1);
});