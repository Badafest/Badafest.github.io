var translate = false;
var rotate = false;
var scale = false;
var skewX = false;
var skewY = false;

var transCoords = [];

var tempTranslate = [0, 0];
var tempRotate = 0;
var tempScale = [1, 1];
var tempSkewX = 0;
var tempSkewY = 0;

var cx = 0;
var cy = 0;
var C = [0, 0];
var x = 0;
var y = 0;
var width = 0;
var height = 0;
var transformObj = null;
var originalTransform = null;

const transformObject = (obj) => {
    removeById('transformBox');
    removeById('transHandle');
    removeById('rotHandle');
    removeById('scaleHandle');
    removeById('skewXHandle');
    removeById('skewYHandle');

    var bbox = obj.getBoundingClientRect();
    var svgBBox = svg.getBoundingClientRect();
    var origin = svg.getAttribute('viewBox').split(' ').slice(0, 2);
    x = (parseFloat(bbox.x) - parseFloat(svgBBox.x)) / svgUnits + parseFloat(origin[0]);
    width = parseFloat(bbox.width) / svgUnits;
    y = (parseFloat(bbox.y) - parseFloat(svgBBox.y)) / svgUnits + parseFloat(origin[1]);
    height = parseFloat(bbox.height) / svgUnits;
    cx = Math.round((x + 0.5 * width) * 1000000) / 1000000;
    cy = Math.round((y + 0.5 * height) * 1000000) / 1000000;
    if (obj != transformObj) {
        transformObj = obj;
        originalTransform = obj.getAttribute('transform');
        if (originalTransform == null) {
            originalTransform = `translate(0,0)\nrotate(0)\nscale(1,1)\nskewX(0)\nskewY(0)`;
        };
        C = [cx, cy];
    };
    var transform = obj.getAttribute('transform');
    if (transform == null) {
        obj.setAttribute('transform', `translate(0,0)\nrotate(0)\nscale(1,1)\nskewX(0)\nskewY(0)`);
    };

    transformBox = drawBoundingBox(obj);
    transformBox.id = 'transformBox';
    transformBox.setAttribute('rx', '0');
    //translation handle
    var transHandle = document.createElementNS(ns, 'rect');
    transHandle.setAttribute('stroke-width', 1 / svgUnits);
    transHandle.setAttribute('x', cx - 5 / svgUnits);
    transHandle.setAttribute('y', y - 15 / svgUnits);
    transHandle.setAttribute('width', 10 / svgUnits);
    transHandle.setAttribute('height', 10 / svgUnits);
    svg.append(transHandle);
    transHandle.setAttribute('id', 'transHandle');
    transHandle.setAttribute('class', 'handle');

    // transHandle.addEventListener('click', () => {
    //     transCoords.push(coordinates.innerText.split(', '));
    //     if (transCoords.length < 2) {
    //         translate = true;
    //     } else {
    //         originalTransform = obj.getAttribute('transform');
    //         transCoords = [];
    //         translate = false;
    //         tempTranslate = [0, 0];
    //     };
    // });

    //rotation handle
    var rotHandle = document.createElementNS(ns, 'ellipse');
    rotHandle.setAttribute('stroke-width', 1 / svgUnits);
    rotHandle.setAttribute('cx', cx);
    rotHandle.setAttribute('cy', y - 30 / svgUnits);
    rotHandle.setAttribute('rx', 8 / svgUnits);
    svg.append(rotHandle);
    rotHandle.setAttribute('id', 'rotHandle');
    rotHandle.setAttribute('class', 'handle');

    // rotHandle.addEventListener('click', () => {
    //     rotCoords.push(coordinates.innerText.split(', '));
    //     if (rotCoords.length < 2) {
    //         rotate = true;
    //     } else {
    //         originalTransform = obj.getAttribute('transform');
    //         rotCoords = [];
    //         rotate = false;
    //         tempRotate = 0;
    //     }
    // });

    //scale handle
    var scaleHandle = document.createElementNS(ns, 'rect');
    scaleHandle.setAttribute('stroke-width', 1 / svgUnits);
    scaleHandle.setAttribute('x', x + width + 5 / svgUnits);
    scaleHandle.setAttribute('y', y + height + 5 / svgUnits);
    scaleHandle.setAttribute('width', 10 / svgUnits);
    scaleHandle.setAttribute('height', 10 / svgUnits);
    svg.append(scaleHandle);
    scaleHandle.setAttribute('id', 'scaleHandle');
    scaleHandle.setAttribute('class', 'handle');

    //skewX handle
    var skewXHandle = document.createElementNS(ns, 'rect');
    skewXHandle.setAttribute('stroke-width', 1 / svgUnits);
    skewXHandle.setAttribute('x', cx);
    skewXHandle.setAttribute('y', y + height + 6 / svgUnits);
    skewXHandle.setAttribute('width', 8 / svgUnits);
    skewXHandle.setAttribute('height', 8 / svgUnits);
    svg.append(skewXHandle);
    skewXHandle.setAttribute('id', 'skewXHandle');
    skewXHandle.setAttribute('class', 'handle');

    //skewY handle
    var skewYHandle = document.createElementNS(ns, 'rect');
    skewYHandle.setAttribute('stroke-width', 1 / svgUnits);
    skewYHandle.setAttribute('x', x - 14 / svgUnits);
    skewYHandle.setAttribute('y', cy);
    skewYHandle.setAttribute('width', 8 / svgUnits);
    skewYHandle.setAttribute('height', 8 / svgUnits);
    svg.append(skewYHandle);
    skewYHandle.setAttribute('id', 'skewYHandle');
    skewYHandle.setAttribute('class', 'handle');

};

const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);

const moveObject = (obj, dX, dY) => {
    var transform = obj.getAttribute('transform');
    var translate = /translate\(.*\)/.exec(transform);
    if (translate == null) {
        obj.setAttribute('transform', transform + `\ntranslate(${dX},${dY})`);
    } else {
        var index = translate.index;
        translate = translate[0];
        var len = translate.length;
        translate = translate.substring(10, len - 1).split(',');
        var idx = parseFloat(translate[0]);
        var idy = translate.length > 0 ? parseFloat(translate[1]) : 0;
        transform = transform.substring(0, index) + `translate(${idx+dX},${idy+dY})` + transform.substring(index + len);
        obj.setAttribute('transform', transform);
    };
};

const rotateObject = (obj, theta) => {
    var transform = obj.getAttribute('transform');
    var rotate = /rotate\(.*\)/.exec(transform);
    if (rotate == null) {
        obj.setAttribute('transform', transform + `\nrotate(${theta})`);
    } else {
        var index = rotate.index;
        rotate = rotate[0];
        var len = rotate.length;
        rotate = rotate.substring(7, len - 1).split(',');
        var itheta = parseFloat(rotate[0]);
        transform = transform.substring(0, index) + `rotate(${itheta+theta})` + transform.substring(index + len);
        obj.setAttribute('transform', transform);
    };
};

// const rotateObject = (obj, theta,cx=0,cy=0) => {
//     var transform = obj.getAttribute('transform');
//     var rotates = [...transform.matchAll(/rotate\(.*\)/g)];
//     if (rotates.length == 0) {
//         obj.setAttribute('transform', transform + `\nrotate(${theta},${cx},${cy})`);
//     } else {
//         var matchNotFound = true;
//         var t = 0;
//         while (matchNotFound && t < rotates.length) {
//             var rotate = rotates[t]
//             var index = rotate.index;
//             rotate = rotate[0];
//             var len = rotate.length;
//             rotate = rotate.substring(7, len - 1).split(',');
//             var itheta = parseFloat(rotate[0]);
//             var icx = rotate.length > 0 ? parseFloat(rotate[1]) : cx;
//             var icy = rotate.length > 1 ? parseFloat(rotate[2]) : cy;
//             if (icx == cx && icy == cy) {
//                 transform = transform.substring(0, index) + `rotate(${theta+itheta},${cx},${cy})` + transform.substring(index + len);
//                 matchNotFound = false;
//             };
//             t++;
//         };
//         if (matchNotFound) { transform = transform + `\nrotate(${theta},${cx},${cy})`; }
//         obj.setAttribute('transform', transform);
//     };
// };

const scaleObject = (obj, scX, scY) => {
    var transform = obj.getAttribute('transform');
    var scale = /scale\(.*\)/.exec(transform);
    if (scale == null) {
        obj.setAttribute('transform', transform + `\nscale(${scX},${scY})`);
    } else {
        var index = scale.index;
        scale = scale[0];
        var len = scale.length;
        scale = scale.substring(6, len - 1).split(',');
        var isx = parseFloat(scale[0]);
        var isy = parseFloat(scale[1]) > 0 ? parseFloat(scale[1]) : 1;
        transform = transform.substring(0, index) + `scale(${isx*scX},${isy*scY})` + transform.substring(index + len);
        obj.setAttribute('transform', transform);
    }
};

const skewXObject = (obj, angle) => {
    var transform = obj.getAttribute('transform');
    var skewX = /skewX\(.*\)/.exec(transform);
    if (skewX == null) {
        obj.setAttribute('transform', transform + `\nskewX(${angle})`);
    } else {
        var index = skewX.index;
        skewX = skewX[0];
        var len = skewX.length;
        skewX = skewX.substring(6, len - 1).split(',');
        var iang = parseFloat(skewX[0]);
        transform = transform.substring(0, index) + `skewX(${iang+angle})` + transform.substring(index + len);
        obj.setAttribute('transform', transform);
    };
};

const skewYObject = (obj, angle) => {
    var transform = obj.getAttribute('transform');
    var skewY = /skewY\(.*\)/.exec(transform);
    if (skewY == null) {
        obj.setAttribute('transform', transform + `\nskewY(${angle})`);
    } else {
        var index = skewY.index;
        skewY = skewY[0];
        var len = skewY.length;
        skewY = skewY.substring(6, len - 1).split(',');
        var iang = parseFloat(skewY[0]);
        transform = transform.substring(0, index) + `skewY(${iang+angle})` + transform.substring(index + len);
        obj.setAttribute('transform', transform);
    };
};

workingArea.addEventListener('mousemove', () => {
    if (translate) {
        var A = transCoords[0];
        var B = coordinates.innerText.split(', ');
        var dX = parseFloat(B[0]) - parseFloat(A[0]) - tempTranslate[0];
        var dY = parseFloat(B[1]) - parseFloat(A[1]) - tempTranslate[1];
        tempTranslate[0] += dX;
        tempTranslate[1] += dY;
        moveObject(transformObj, dX, dY);
        transformObject(transformObj);
        C = [C[0] + dX, C[1] + dY];
    } else if (rotate) {
        var A = [parseFloat(transCoords[0][0]), parseFloat(transCoords[0][1])];
        var B = coordinates.innerText.split(', ');
        B = [parseFloat(B[0]), parseFloat(B[1])];
        var r = 0.5 * Math.max(width, height) + 30 / svgUnits;
        var d = Math.max(0.00001, dist(B, C));
        B[0] = C[0] + (r / d) * (B[0] - C[0]);
        B[1] = C[1] + (r / d) * (B[1] - C[1]);
        var a = [A[0] - C[0], A[1] - C[1]];
        var b = [B[0] - C[0], B[1] - C[1]];
        var theta = 180 * (Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1])) / Math.PI;
        dTheta = theta - tempRotate;
        tempRotate += dTheta
        rotHandle.setAttribute('cx', B[0]);
        rotHandle.setAttribute('cy', B[1]);
        rotHandle.setAttribute('transform', '');
        rotateObject(transformObj, dTheta, cx, cy);
        transformObject(transformObj);
    } else if (scale) {
        var A = transCoords[0];
        var B = coordinates.innerText.split(', ');
        var scX = (parseFloat(B[0]) - cx) / ((parseFloat(A[0]) - cx) * tempScale[0]);
        var scY = (parseFloat(B[1]) - cy) / ((parseFloat(A[1]) - cy) * tempScale[1]);
        // var scX = (parseFloat(B[0]) - cx) / (parseFloat(A[0]) - cx);
        // var scY = (parseFloat(B[1]) - cy) / (parseFloat(A[1]) - cy);
        scX == 0 ? scX = 0.0000001 : scX;
        scY == 0 ? scY = 0.0000001 : scY;
        scaleObject(transformObj, scX, scY);
        // moveObject(transformObj, tempScale[0] * (1 - scX) * cx, tempScale[1] * (1 - scY) * cy);
        tempScale[0] *= scX;
        tempScale[1] *= scY;
        transformObject(transformObj);
    } else if (skewX) {
        var A = transCoords[0];
        var B = coordinates.innerText.split(', ');
        var skX = parseFloat(B[0]) - parseFloat(A[0]);
        var skXang = 180 * (Math.atan2(skX, height)) / Math.PI - tempSkewX;
        tempSkewX += skXang;
        skewXObject(transformObj, skXang);
        // moveObject(transformObj, -width * Math.tan(skXang * Math.PI / 180), 0)
        transformObject(transformObj);
    } else if (skewY) {
        var A = transCoords[0];
        var B = coordinates.innerText.split(', ');
        var skY = parseFloat(A[1]) - parseFloat(B[1]);
        var skYang = 180 * (Math.atan2(skY, width)) / Math.PI - tempSkewY;
        tempSkewY += skYang;
        skewYObject(transformObj, skYang);
        // moveObject(transformObj, 0, -height * Math.tan(skYang * Math.PI / 180))
        transformObject(transformObj);
    };
});

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        if (transformObj != null) { transformObj.setAttribute('transform', originalTransform) };
        translate = false;
        rotate = false;
        scale = false;
        skewX = false;
        skewY = false;
        transformObj = null;
        originalTransform = null;
        removeById('transformBox');
        removeById('transHandle');
        removeById('rotHandle');
        removeById('scaleHandle');
        removeById('skewXHandle');
        removeById('skewYHandle');
    } else if (event.key == 'Enter') {
        var clickEvent = new Event('click');
        if (translate || rotate || scale || skewX || skewY) {
            workingArea.dispatchEvent(clickEvent);
        };
    };
});

workingArea.addEventListener('click', (evt) => {
    if (transCoords.length == 0) {
        switch (evt.target) {
            case document.getElementById('transHandle'):
                translate = true;
                transCoords.push(coordinates.innerText.split(', '));
                break;
            case document.getElementById('rotHandle'):
                rotate = true;
                transCoords.push(coordinates.innerText.split(', '));
                break;
            case document.getElementById('scaleHandle'):
                scale = true;
                transCoords.push(coordinates.innerText.split(', '));
                break;
            case document.getElementById('skewXHandle'):
                skewX = true;
                transCoords.push(coordinates.innerText.split(', '));
                break;
            case document.getElementById('skewYHandle'):
                skewY = true;
                transCoords.push(coordinates.innerText.split(', '));
                break;

            default:
                break;
        }
    } else {
        translate = rotate = scale = skewX = skewY = false;
        originalTransform = transformObj ? transformObj.getAttribute('transform') : originalTransform;
        transCoords = [];
        tempTranslate = [0, 0];
        tempRotate = tempSkewX = tempSkewY = 0;
        tempScale = [1, 1];
    }
});