var openSvgIcon = document.getElementById('openSvg');
var saveSvgIcon = document.getElementById('saveSvg');
var savePngIcon = document.getElementById('savePng');

var svgHistory = [svg.cloneNode(true)];
var historyPosition = 1;
var maxHistory = 100;
var jpegQuality = null;

var defaultImgWidth = svg.clientWidth;
var defaultImgHeight = svg.clientHeight;

const updateSvgHistory = (latestSvg) => {
    if ([undefined, null].indexOf(svg.getElementById('tempObj')) != -1) {
        var lastSvg = svgHistory[svgHistory.length - 1];
        if (latestSvg.innerHTML != lastSvg.innerHTML) {
            svgHistory.push(latestSvg);
            historyPosition = 1;
        };
        if (svgHistory.length > maxHistory) {
            svgHistory.shift();
        };
    };
};

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && activeTool == null) {
        if (event.key == 'z' && svgHistory.length > historyPosition) {
            historyPosition = historyPosition + 1;
            openSvg(svgHistory[svgHistory.length - historyPosition]);
            if ([undefined, null].indexOf(document.getElementById('timeLine')) == -1) {
                timeLine();
            };
        } else if (event.key == 'y' && historyPosition > 1) {
            historyPosition = historyPosition - 1;
            openSvg(svgHistory[svgHistory.length - historyPosition]);
            if ([undefined, null].indexOf(document.getElementById('timeLine')) == -1) {
                timeLine();
            };
        }
    } else if (event.key == 'Escape') {
        var latestSvg = document.createElementNS(ns, 'svg');
        svg.getAttributeNames().forEach((x) => {
            latestSvg.setAttribute(x, svg.getAttribute(x));
        });
        svg.childNodes.forEach((x) => {
            if (['boundingBox', 'transformBox', 'tempObj', 'transHandle', 'rotHandle', 'scaleHandle', 'skewXHandle', 'skewYHandle'].indexOf(x.id) == -1) {
                latestSvg.append(x.cloneNode(true));
            };
        });
        latestSvg.setAttribute('canvasWidth', `${workingArea.clientWidth}px`);
        latestSvg.setAttribute('canvasHeight', `${workingArea.clientHeight}px`);
        updateSvgHistory(latestSvg);
    }
});

saveSvgIcon.addEventListener('click', () => {
    pressEsc();
    svg.setAttribute('canvasWidth', `${workingArea.clientWidth}px`);
    svg.setAttribute('canvasHeight', `${workingArea.clientHeight}px`);
    var fReader = new FileReader();
    fReader.readAsDataURL(svgImg('svg'));
    fReader.onloadend = (event) => {
        var imgSvg = event.target.result;
        triggerDownload(imgSvg, 'img.svg');
    }
});

savePngIcon.addEventListener('click', (event) => {
    pressEsc();
    removeById('objIn');
    var imgDB = document.createElement('div');
    imgDB.id = 'objIn';
    imgDB.style.left = `${event.clientX - 55}px`;
    imgDB.style.top = `${event.clientY + 25}px`;
    var widthIn = document.createElement('div');
    widthIn.setAttribute('contentEditable', 'true');
    widthIn.id = 'typeIn';
    var heightIn = document.createElement('div');
    heightIn.setAttribute('contentEditable', 'true');
    heightIn.id = 'typeIn';
    imgDB.append(document.createTextNode('Width'));
    imgDB.append(widthIn);
    widthIn.innerText = defaultImgWidth || svg.clientWidth;
    imgDB.append(document.createTextNode('Height'));
    imgDB.append(heightIn);
    heightIn.innerText = defaultImgHeight || svg.clientHeight;
    var okButton = document.createElement('button');
    okButton.innerText = 'OK';
    imgDB.append(okButton);
    document.body.append(imgDB);
    okButton.addEventListener('click', () => {
        var fReader = new FileReader();
        fReader.readAsDataURL(svgImg('png'));
        fReader.onloadend = (event) => {
            var imgSvg = event.target.result;
            var img = initializePngImg(imgSvg);
            img.onload = () => {
                triggerDownload(drawPngImageFx(widthIn.innerText, heightIn.innerText, img), 'img.png');
            };
        }
    });
});

openSvgIcon.addEventListener('click', () => {
    pressEsc();
    if (confirm('Unsaved content will be lost. Do you wish to continue?')) {
        var svgUpload = document.createElement('input');
        svgUpload.type = 'file';
        svgUpload.accept = '.svg';
        svgUpload.click();
        var fReader = new FileReader();
        svgUpload.onchange = () => {
            fReader.readAsText(svgUpload.files[0]);
            fReader.onloadend = (event) => {
                var svgNew = (new DOMParser()).parseFromString(event.target.result, 'text/xml').childNodes[0];
                openSvg(svgNew);
                initScenes();
            };
        };
        svgUpload.remove();
    };
});

const triggerDownload = (blob, fileName) => {
    var a = document.createElement('a');
    a.setAttribute('href', blob);
    a.setAttribute('download', fileName);
    a.click();
    a.remove();
};

const svgImg = (format = 'svg') => {
    var ser = new XMLSerializer();
    if (format != 'svg') {
        var svgClone = svg.cloneNode(true);
        svgClone.childNodes.forEach((obj) => {
            if (obj.getAttribute('scene') && parseInt(obj.getAttribute('scene')) != activeScene) {
                obj.remove();
            };
        });
        var animations = Array.from(svg.getElementsByClassName('animation'));
        var motionAnims = animations.filter((x) => { return x.tagName == 'animateMotion' });
        motionAnims.forEach((motAnim) => {
            var elem = svgClone.getElementById(motAnim.getAttribute('href').slice(1));
            var elemCopy = elem.cloneNode(true);
            svg.append(elemCopy);
            elemCopy.id = '';
            var elemBBox = elemCopy.getBoundingClientRect();
            var elemOrg = svg.getElementById(elem.id);
            var elemOrgBBox = elemOrg.getBoundingClientRect();
            var t = elemOrg.getAttribute('transform');
            var dx = (elemOrgBBox.x - elemBBox.x + (elemOrgBBox.width - elemBBox.width) / 2) / svgUnits;
            var dy = (elemOrgBBox.y - elemBBox.y + (elemOrgBBox.height - elemBBox.height) / 2) / svgUnits;
            elemOrg.setAttribute('transform', t ? t + `\ntranslate(${dx},${dy})` : `translate(${dx},${dy})`);
            elemOrg.setAttribute('orgLength', t.length);
            elemCopy.remove();
        });
        var changedElems = [];
        animations.forEach((animation) => {
            var elem = svgClone.getElementById(animation.getAttribute('href').slice(1));
            var elemOrg = svg.getElementById(elem.id);
            if (changedElems.indexOf(elem) == -1 && [null, undefined].indexOf(elem) == -1) {
                var compStyle = window.getComputedStyle(elemOrg);
                elem.getAttributeNames().forEach((attrNam) => {
                    var propVal = compStyle.getPropertyValue(attrNam);
                    if (attrNam == 'd') {
                        propVal = propVal.slice(6, propVal.length - 2);
                    }
                    elem.setAttribute(attrNam, propVal);
                });
                changedElems.push(elem);
            };
            if (animation.tagName == 'animateMotion') {
                var t = elemOrg.getAttribute('transform');
                elemOrg.setAttribute('transform', t.slice(0, parseInt(elemOrg.getAttribute('orgLength'))));
                elemOrg.removeAttribute('orgLength');
            }
        });
    };
    var svgBlob = new Blob([ser.serializeToString(format == 'svg' ? svg : svgClone)], { type: "image/svg+xml;charset=utf-8" });
    return svgBlob;
    // fReader.onloadend = (event) => {
    //     imgSvg = event.target.result;
    //     if (format != 'svg') {
    //         initializePngImg();
    //         img.onload = (ctx) => { drawPngImageFx(ctx) };
    //     } else {
    //         if (downloadImg) { triggerDownload(imgSvg, `img.${format}`); }
    //     };
    // };
};

const openSvg = (svgNew) => {
    // var width = svg.getAttribute('width');
    // var height = svg.getAttribute('height');
    // svgNew.setAttribute('width', width);
    // svgNew.setAttribute('height', height);
    workingArea.append(svgNew);
    if (!svgNew.getElementById('minorGridLines')) {
        console.log(svg.getElementsByTagName('defs')[0]);
        svgNew.prepend(svg.getElementsByTagName('defs')[0]);
    };
    svg.remove();
    workingArea.style.width = svgNew.getAttribute('canvasWidth') || workingArea.style.width;
    workingArea.style.height = svgNew.getAttribute('canvasHeight') || workingArea.style.height;
    svg = svgNew;
    svg.id = 'svg';
    var minorGridTemp = document.getElementById('minorGrid');
    if (minorGridTemp != null && minorGridTemp != undefined) {
        minorGrid = minorGridTemp;
        // minorGrid.setAttribute('width', width);
        // minorGrid.setAttribute('height', height);
        minorGridOn = true;
    }
    var majorGridTemp = document.getElementById('majorGrid');
    if (majorGridTemp != null && majorGridTemp != undefined) {
        majorGrid = majorGridTemp;
        // majorGrid.setAttribute('width', width);
        // majorGrid.setAttribute('height', height);
        majorGridOn = true;
    };
    // resetSvg.click();
    var objects = Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 });

    objects.forEach((obj) => {
        if (obj.id == 'boundingBox') {
            obj.remove();
        }
        if (obj.id != 'minorGrid' && obj.id != 'majorGrid') {
            if (obj.getAttribute('class') != 'maskedObject') {
                obj.addEventListener('click', (event) => { editObject(event, obj) });
                obj.addEventListener('mouseenter', () => { drawBoundingBox(obj); });
                obj.addEventListener('mouseout', () => { removeById('boundingBox'); });
            } else {
                obj.addEventListener('click', (e) => { if (e.ctrlKey) { obj.remove(); } })
            }
        };
    });
    if ([undefined, null].indexOf(document.getElementById('timeline')) == -1) {
        timeLine();
    };
    var grads = Array.from(svg.getElementsByTagName('linearGradient')).concat(...svg.getElementsByTagName('radialGradient'));
    grads.forEach((x) => {
        if (parseInt(x.id.slice(8)) > gradCount) {
            gradCount = parseInt(x.id.slice(8));
        };
    });
    defaultImgWidth = svg.clientWidth;
    defaultImgHeight = svg.clientHeight;
};

const initializePngImg = (imgSvg) => {
    var img = document.createElement('img');
    img.src = imgSvg;
    return img;
};

const drawPngImageFx = (imgWidth, imgHeight, img, quality = jpegQuality) => {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = parseFloat(imgWidth) || svg.clientWidth;
    canvas.height = parseFloat(imgHeight) || svg.clientHeight;
    img.width = canvas.width;
    img.height = canvas.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    defaultImgHeight = img.height;
    defaultImgWidth = img.width;
    return quality ? canvas.toDataURL(`image/jpeg`, quality) : canvas.toDataURL(`image/png`);
};