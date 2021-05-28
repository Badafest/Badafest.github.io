var frameWindow;
var testDoc;
var Frames;
var frameZip;

const openFrameWindow = (title, width = defaultImgWidth, height = defaultImgHeight) => {
    frameWindow = window.open();
    frameDoc = frameWindow.document;
    frameDoc.title = title;
    frameDoc.body.style = `font-family:Arial; font-size:12px; display:grid;grid-template-columns:${'auto '.repeat(Math.floor(parseFloat(window.innerWidth)/350))}`;
    var index = 0;
    var imgEx = jpegQuality ? 'jpg' : 'png';
    frameZip = new JSZip();
    var zipLink = document.createElement('a');
    zipLink.style = 'text-decoration:none;color:blueviolet;font-size: 16px; padding:6px 8px; background:white;position:absolute;right:50%;transform:translate(50%);top:4px;border:1px solid blueviolet; border-radius:12px;transition:all 0.5s'
    zipLink.innerText = 'Preparing Zip';
    frameDoc.body.append(zipLink);
    framesArray.forEach((frameImage) => {
        var frameLink = document.createElement('a');
        frameLink.style = 'padding:2px; margin:2px; text-decoration:none;color:blueviolet;font-size:12px;text-align:center;border:1px solid rgb(190,190,190)';
        var thumbnail = document.createElement('img');
        thumbnail.setAttribute('width', '350px');
        var label = document.createElement('p');
        var img = initializePngImg(frameImage);
        img.onload = () => {
            var pngImg = drawPngImageFx(width, height, img);
            frameLink.setAttribute('href', pngImg);
            frameZip.file(`frame${index}.${imgEx}`, window.atob(pngImg.replace(/^data[^,]+,/, '')), { binary: true });
            frameDoc.body.append(frameLink);
            frameLink.setAttribute('download', `frame${index}.${imgEx}`);
            thumbnail.setAttribute('src', frameImage);
            frameLink.append(thumbnail);
            label.innerText = `FRAME-${index}`;
            frameLink.append(label);
            index++;
            removeById('Fprogress');
            prg = openProgressMsg('Generating Frames', Math.round(100 * index / framesArray.length));
            prg.id = 'Fprogress';
            if (index == framesArray.length) {
                removeById('Fprogress');
                prg = openProgressMsg('Compressing to Zip', null);
                prg.id = 'Fprogress';
                frameZip.generateAsync({ type: 'blob' }).then((content) => {
                    removeById('Fprogress');
                    zipLink.setAttribute('href', URL.createObjectURL(content));
                    zipLink.setAttribute('download', 'frames.zip');
                    zipLink.innerText = 'Download Zip';
                    zipLink.style.color = 'white';
                    zipLink.style.background = 'blueviolet';
                });
            }
        };
    });
};

var recorder;
const canvasRecordedVideo = (framesArray, width, height, fps) => {
    if (framesArray.length < 10) {
        openActionMsg('Too less frames');
        return 0;
    }
    Frames = [];
    var vidCanvas = document.createElement('canvas');
    var overLay = document.createElement('div');
    framesArray.forEach((frame) => {
        var img = document.createElement('img');
        img.setAttribute('src', frame);
        Frames.push(img);
    });
    vidCanvas.style = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)';

    overLay.style = 'display:flex;align-items:center;justify-content:center;position:absolute;height:100%;width:100%;background:rgba(255,255,255,0.85);';
    var warning = document.createElement('p');
    warning.style = 'text-align:left; width:50%;border:1px solid rgb(110,110,110);border-radius:12px;color:rgb(250,60,60);padding:12px;background:white;'
    warning.innerHTML = '<b>DONOT</b><br><br>\u2022 MINIMIZE<br>\u2022 CHANGE TAB<br>\u2022 OR DO ANYTHING THAT HIDES THIS MESSAGE.<br><br>Please Have Patience For ';

    var timeLeft = document.createElement('b');
    timeLeft.innerText = `${Math.ceil(framesArray.length/fps)}s`;

    var timeLeftInterval = setInterval(() => {
        timeLeft.innerText = `${parseInt(timeLeft.innerText)-1}s`;
        if (timeLeft.innerText == '1s') {
            clearInterval(timeLeftInterval);
        };
    }, 1050);

    overLay.append(warning);
    warning.append(timeLeft);

    document.body.append(overLay);
    vidCanvas.id = 'vidCanvas';
    overLay.id = 'vidOverlay';

    vidCanvas.setAttribute('width', width);
    vidCanvas.setAttribute('height', height);
    ctx = vidCanvas.getContext('2d');

    var chunks = [];
    var cStream = vidCanvas.captureStream(fps);
    recorder = new MediaRecorder(cStream);

    recorder.ondataavailable = (e) => { chunks.push(e.data); };
    recorder.onstop = () => {
        var blob = new Blob(chunks, { 'type': 'video/webm' });
        var title = `WEBM [${width} x ${height} @ ${fps}]`;
        openVidWindow(blob, title);
    };

    var x = 0;
    var tOut;
    var anim = function() {
        ctx.drawImage(Frames[x], 0, 0);
        x = x + 1;
        if (x < framesArray.length - 1) {
            tOut = setTimeout(() => { requestAnimationFrame(anim); }, 1000 / fps);
        } else {
            clearTimeout(tOut);
            recorder.stop();
            vidCanvas.remove();
            overLay.remove();
            recorder = null;
        };
    };

    anim();
    recorder.start();
};

const ffmpegEncodedVideo = (framesArray, width, height, fps) => {
    Frames = [];
    framesArray.forEach((frame) => {
        var img = initializePngImg(frame);
        img.onload = () => {
            dataURI = drawPngImageFx(width, height, img, jpegQuality || 1);
            var base64 = dataURI.replace(/^data[^,]+,/, '');
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var data = new Uint8Array(new ArrayBuffer(rawLength));
            for (i = 0; i < rawLength; i++) {
                data[i] = raw.charCodeAt(i);
            }
            var n = Frames.length;
            n = n < 10 ? '000' + n : (n < 100 ? '00' + n : (n < 1000 ? '0' + n : n));
            Frames.push({ 'name': `img${n}.jpg`, data });
            removeById('Vprogress');
            prg = openProgressMsg('Processing Frames', Math.round(100 * n / framesArray.length));
            prg.id = 'Vprogress';
            if (Frames.length == framesArray.length) {
                removeById('Vprogress');
                prg = openProgressMsg('Initializing FFMPEG', null);
                prg.id = 'Vprogress';
                initFF();
            };
        };
    });
    const initFF = () => {
        ffmpegWorker = new Worker('./ffmpeg/ffmpeg.js');
        ffmpegWorker.onmessage = (event) => {
            var msg = event.data;
            if (msg.type == 'done') {
                removeById('Vprogress');
                var blob = new Blob([msg.data.MEMFS[0].data], { type: "video/mp4" });
                var title = `MP4 [${width} x ${height} @ ${fps}]`;
                openVidWindow(blob, title);
            } else if (msg.type == 'ready') {
                ffmpegWorker.postMessage({
                    type: 'run',
                    TOTAL_MEMORY: 1073741824,
                    // arguments: `ffmpeg -framerate ${fps} -i img%4d.png out.mp4`.split(' '),
                    arguments: ["-r", `${fps}`, "-i", "img%4d.jpg", "out.mp4"],
                    //arguments: '-r 60 -i img%03d.jpeg -c:v libx264 -crf 1 -vf -pix_fmt yuv420p -vb 20M out.mp4'.split(' '),
                    // arguments: ["-i", "img%4d.jpg", "out.mp4"],
                    MEMFS: Frames
                });
            } else if (msg.type == 'stderr' && msg.data) {
                if (msg.data.startsWith('frame= ')) {
                    removeById('Vprogress');
                    prg = openProgressMsg('Encoding Frames', Math.round(100 * parseInt(msg.data.slice(6)) / framesArray.length));
                    prg.id = 'Vprogress';
                }
            };
        };
    };
};

const openVidWindow = (blob, title = '') => {
    var vidURL = URL.createObjectURL(blob);
    var vid = document.createElement('video');
    vid.controls = true;
    vid.style = `max-height:${svg.getBoundingClientRect().height}px;max-width:${svg.getBoundingClientRect().width}px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)`;
    vid.src = vidURL;
    var tempWindow = window.open();
    tempWindow.onload = () => {
        tempWindow.document.title = title;
        tempWindow.document.body.append(vid);
        removeById('vidCanvas');
        removeById('vidOverlay');
    };
};

document.addEventListener('keydown', (evt) => {
    if (evt.key == 'Escape') {
        removeById('vidCanvas');
        removeById('vidOverlay');
        if (recorder) {
            recorder.stop();
            recorder = null;
        }
    };
});