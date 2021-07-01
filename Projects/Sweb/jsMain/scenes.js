var activeScene = 1;
var maxScene = 1;
var currMode = 'edit';
var sceneChange = 'manual';

var presentPlayPauseBtn = document.getElementById('presentPlayPause');
var animPauseTime = 0;
var animPlayStart;
var animClockPlay;

const initScenes = () => {
    var objects = Array.from(svg.childNodes).filter((x) => {
        return ['majorGrid', 'minorGrid'].indexOf(x.id) == -1 && ['defs', 'style'].indexOf(x.tagName) == -1
    });
    objects.forEach((obj) => {
        if (obj.getAttribute) {
            if ([undefined, null].indexOf(obj.getAttribute('scene')) != -1) {
                obj.setAttribute('scene', activeScene);
            } else if (parseInt(obj.getAttribute('scene')) != activeScene) {
                obj.style.display = 'none';
                if (parseInt(obj.getAttribute('scene')) > maxScene) {
                    maxScene = parseInt(obj.getAttribute('scene'));
                }
            } else {
                obj.style.display = '';
            };
        };
    });
    stopAllAnimations();
    if ([undefined, null].indexOf(document.getElementById('timeline')) == -1) { timeLine(); };
};

const changeScene = (sceneNo = null) => {
    activeScene = sceneNo || activeScene + 1;
    if ([null, undefined].indexOf(document.getElementById('timeline')) == -1) { document.getElementById('animationStopButton').click() };
    document.getElementById('sceneList').innerText = activeScene;
    initScenes();
};

document.getElementById('presentMenu').addEventListener('mouseenter', () => {
    document.getElementById('presentMenu').style.opacity = 1;
    document.getElementById('animClock').style.opacity = 1;
});

document.getElementById('presentMenu').addEventListener('mouseleave', () => {
    document.getElementById('presentMenu').style.opacity = 0;
    document.getElementById('animClock').style.opacity = 0;
});

document.getElementById('modeIcon').addEventListener('click', () => {
    pressEsc();
    stopAllAnimations();
    animPauseTime = 0;
    clearInterval(animClockPlay);
    document.getElementById('animClock').innerText = '00:00.00';
    if (currMode == 'edit') {
        currMode = 'present';
        removeById('timeline');
        Array.from(document.getElementsByClassName('menu')).forEach((x) => {
            x.style.display = 'none';
        });
        presentPlayPauseBtn.innerText = '▶';
        document.getElementById('animClock').style.display = 'block';
        document.getElementById('presentModeIcon').style.display = 'block';
        document.getElementById('editModeIcon').style.display = 'none';
        document.getElementById('presentMenu').style.display = '';
    } else {
		Array.from(svg.getElementsByClassName('markerPath')).forEach((x)=>{x.remove();});
        currMode = 'edit';
        Array.from(document.getElementsByClassName('menu')).forEach((x) => {
            x.style.display = '';
        });
        document.getElementById('editModeIcon').style.display = 'block';
        document.getElementById('presentModeIcon').style.display = 'none';
        document.getElementById('presentMenu').style.display = 'none';
        document.getElementById('animClock').style.display = 'none';
    };
});

document.getElementById('prevScene').addEventListener('click', () => {
    stopAllAnimations();
    if (activeScene > 1) { changeScene(activeScene - 1) };
});

document.getElementById('nextScene').addEventListener('click', () => {
    stopAllAnimations();
    if (activeScene < maxScene) { changeScene(activeScene + 1) };
});

document.getElementById('presentPrevScene').addEventListener('click', () => {
    stopAllAnimations();
    animPauseTime = 0;
    clearInterval(animClockPlay);
    document.getElementById('animClock').innerText = '00:00.00';
    presentPlayPauseBtn.innerText = '▶';
    if (activeScene > 1) { changeScene(activeScene - 1) };
});

document.getElementById('presentNextScene').addEventListener('click', () => {
    stopAllAnimations();
    animPauseTime = 0;
    clearInterval(animClockPlay);
    document.getElementById('animClock').innerText = '00:00.00';
    presentPlayPauseBtn.innerText = '▶';
    if (activeScene < maxScene) { changeScene(activeScene + 1) };
});

document.getElementById('addScene').addEventListener('click', (evt) => {
    changeScene(maxScene + 1);
    maxScene += 1;
    if (evt.ctrlKey) {
        var prevSceneObjs = Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) == maxScene - 1 });
        prevSceneObjs.forEach((obj) => {
            var tObj = obj.cloneNode(true);
            tObj.style.display = '';
            tObj.setAttribute('scene', maxScene);
            svg.append(tObj);
            if (evt.altKey) {
                tObj.addEventListener('click', (evt) => { if (evt.ctrlKey) { tObj.remove(); }; });
                tObj.setAttribute('opacity', '0.5');
                tObj.style.cursor = '';
                tObj.setAttribute('class', 'maskedObject');
            } else {
                tObj.addEventListener('click', (event) => { editObject(event, tObj) });
                tObj.addEventListener('mouseenter', () => { drawBoundingBox(tObj); });
                tObj.addEventListener('mouseout', () => { removeById('boundingBox'); });
            };
        });
    };
});

document.getElementById('sceneList').addEventListener('click', (event) => {
    removeById('editTable')
    var scenesDB = document.createElement('div');
    scenesDB.setAttribute('style',
        `position:absolute; bottom:48px; left:${event.x}px; width:10%; max-height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    scenesDB.setAttribute('id', 'editTable');
    var dropDown = document.createElement('div');
    dropDown.style.fontSize = '14px';
    dropDown.style.padding = '2px';
    var currScene = activeScene;
    [...Array(maxScene).keys()].forEach((i) => {
        var option = document.createElement('p');
        option.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
        if (i + 1 == activeScene) {
            option.style.border = '2px solid rgb(110,110,110)';
        };
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgb(90,90,90)';
            option.style.color = 'white';
            changeScene(i + 1);
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'white';
            option.style.color = 'black';
            changeScene(currScene);
        });
        option.addEventListener('click', () => {
            changeScene(i + 1);
            currScene = i + 1;
            Array.from(dropDown.childNodes).forEach((x) => { x.style.border = '0.25px solid rgb(110,110,110)' });
            option.style.border = '2px solid rgb(110,110,110)';
        });
        option.innerText = i + 1;
        dropDown.append(option);
    });
    scenesDB.append(dropDown);
    document.body.append(scenesDB);
});

document.getElementById('mergeScene').addEventListener('click', () => {
    if (activeScene > 1) {
        Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) == activeScene }).forEach((x) => {
            x.setAttribute('scene', activeScene - 1);
        });
        Array.from(svg.childNodes).filter((x) => { return parseInt(x.getAttribute('scene')) > activeScene }).forEach((x) => {
            x.setAttribute('scene', parseInt(x.getAttribute('scene')) - 1);
        });
        changeScene(activeScene - 1);
        maxScene -= 1;
    };
});

var markerPenIcon = document.getElementById('presentMarkerPen');
markerPenIcon.addEventListener('click',()=>{
	pressEsc();
    lastClickedIcon = markerPenIcon;
    clickedCoordinates = [];
    activeTool = 'pen';
    removeById('tempObj');
    waitForPoint();
	openActionMsg('Active Tool: Marker Pen');
});

var erasePenIcon = document.getElementById('presentErasePen');
erasePenIcon.addEventListener('click',()=>{
	pressEsc();
    lastClickedIcon = erasePenIcon;
    clickedCoordinates = [];
    activeTool = 'erase';
    removeById('tempObj');
	openActionMsg('Active Tool: Erase Pen');
});

presentPlayPauseBtn.addEventListener('click', () => {
    if (presentPlayPauseBtn.innerText == '\u25b6') {
        animPlayStart = svg.getCurrentTime();
        svg.unpauseAnimations();
        var animMaxPlayTime = 0;
        Array.from(svg.getElementsByClassName('animation')).forEach((x) => {
            x.setAttribute('begin', `${0.0001+svg.getCurrentTime()+parseFloat(x.getAttribute('start')) - animPauseTime}s`);
            animMaxPlayTime = Math.max(animMaxPlayTime, parseFloat(x.getAttribute('start') + x.getAttribute('dur')));
        });
        presentPlayPauseBtn.innerText = '\u2016';
        animClockPlay = setInterval(() => {
            var animTime = document.getElementById('animClock').innerText.split(':');
            var minutes = parseFloat(animTime[0]);
            var seconds = parseFloat(animTime[1]);
            seconds += 0.01;
            if (seconds > 59.99) {
                minutes += 1;
                seconds -= 60;
            }
            var minString = minutes > 9 ? `${minutes}` : `${'0'+minutes}`;
            seconds = Math.round(seconds * 1000) / 1000;
            var secString = seconds > 9.99 ? `${seconds}` : `${'0'+seconds}`;
            secString = secString.length == 5 ? secString : (secString.length == 4 ? secString + '0' : secString + '.00');
            document.getElementById('animClock').innerText = `${minString}:${secString}`;
            if (sceneChange == 'auto' && minutes / 60 + seconds >= animMaxPlayTime && activeScene < maxScene) {
                document.getElementById('presentNextScene').click();
                presentPlayPauseBtn.click();
            }
        }, 10)
    } else {
        clearInterval(animClockPlay);
        animPauseTime += svg.getCurrentTime() - animPlayStart;
        svg.pauseAnimations();
        presentPlayPauseBtn.innerText = '\u25b6';
    };
});