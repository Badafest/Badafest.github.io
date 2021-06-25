var refObj = null;

(() => {
    const alignIcon = document.createElement('div');
    alignIcon.setAttribute('class', 'exIcon');

    const alignIconSvg = document.createElementNS(ns, 'svg');
    alignIconSvg.setAttribute('viewBox', '0 0 1 1');
    alignIconSvg.setAttribute('width', '100%');
    alignIconSvg.setAttribute('height', '100%');

    const alignPath = document.createElementNS(ns, 'path');
    alignPath.setAttribute('fill', 'white');
    alignPath.setAttribute('stroke', 'rgb(90,90,90)');
    alignPath.setAttribute('stroke-width', '0.05');
    alignPath.setAttribute('d', 'M 0.15 0.15 l 0 0.7 M 0.15 0.2 l 0.35 0 0 0.15 -0.35 0 z M 0.15 0.45 l 0.65 0 0 0.15 -0.65 0 z M 0.15 0.75 l 0.25 0 0 0.15 -0.25 0 z');

    alignIconSvg.append(alignPath);
    alignIcon.append(alignIconSvg);
    document.getElementById('extensionMenu').append(alignIcon);

    addToolTip(alignIcon, 'Align', 'left');

    alignIcon.addEventListener('click', (evt) => {
        pressEsc();
        activeTool = 'align';
        openActionMsg('Active Tool: Align', null);
        removeById('alignDB');
        var alignMenu = document.createElement('div');
        alignMenu.style = `text-align:left; font-size:12px; position:absolute; right:52px; top:${evt.y+24}px; width:auto; padding:6px; border:1px solid rgb(190,190,190); border-radius:8px; background:white;`;
        document.body.append(alignMenu);
        alignMenu.id = 'alignDB';

        var refObjPosDDLR = document.createElement('select');
        refObjPosDDLR.style = `margin:4px;outline:none;`;
        ['center', 'left', 'right'].forEach((opt) => {
            var option = document.createElement('option');
            refObjPosDDLR.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        var refObjPosDDUD = document.createElement('select');
        refObjPosDDUD.style = `margin:4px;outline:none;`;
        ['center', 'top', 'bottom'].forEach((opt) => {
            var option = document.createElement('option');
            refObjPosDDUD.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        var desObjPosDDLR = document.createElement('select');
        desObjPosDDLR.style = `margin:4px;outline:none;`;
        ['center', 'left', 'right'].forEach((opt) => {
            var option = document.createElement('option');
            desObjPosDDLR.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        var desObjPosDDUD = document.createElement('select');
        desObjPosDDUD.style = `margin:4px;outline:none;`;
        ['center', 'top', 'bottom'].forEach((opt) => {
            var option = document.createElement('option');
            desObjPosDDUD.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        alignMenu.append(document.createTextNode('Reference Position'));
        alignMenu.append(document.createElement('br'));
        alignMenu.append(refObjPosDDLR);
        alignMenu.append(refObjPosDDUD);
        alignMenu.append(document.createElement('hr'));
        alignMenu.append(document.createTextNode('Object Position'));
        alignMenu.append(document.createElement('br'));
        alignMenu.append(desObjPosDDLR);
        alignMenu.append(desObjPosDDUD);
        alignMenu.append(document.createElement('hr'));

        Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 && ['minorGrid', 'majorGrid'].indexOf(x.id) == -1 }).forEach((x) => {
            x.addEventListener('click', () => {
                if (activeTool == 'align') {
                    if (refObj && x != refObj) {
                        alignObject(x, refObj, [`${refObjPosDDLR.value}${refObjPosDDUD.value}`, `${desObjPosDDLR.value}${desObjPosDDUD.value}`]);
                    } else {
                        refObj = x;
                    };
                };
            });
        });

        bBoxReqdTools.push('align');
    });
})();

(() => {
    const snapIcon = document.createElement('div');
    snapIcon.setAttribute('class', 'exIcon');

    const snapIconSvg = document.createElementNS(ns, 'svg');
    snapIconSvg.setAttribute('viewBox', '0 0 1 1');
    snapIconSvg.setAttribute('width', '100%');
    snapIconSvg.setAttribute('height', '100%');

    const snapPath = document.createElementNS(ns, 'path');
    snapPath.setAttribute('fill', 'none');
    snapPath.setAttribute('stroke', 'rgb(90,90,90)');
    snapPath.setAttribute('stroke-width', '0.05');
    snapPath.setAttribute('d', 'M 0.15 0.15 c 0.1 0.1 0.7 -0.2 0.7 0.6 M 0.7 0.3 l -0.5 0.2 0.3 0.3 z');

    snapIconSvg.append(snapPath);
    snapIcon.append(snapIconSvg);
    document.getElementById('extensionMenu').append(snapIcon);

    addToolTip(snapIcon, 'Snap', 'left');

    snapIcon.addEventListener('click', (evt) => {
        pressEsc();
        activeTool = 'snap';
        openActionMsg('Active Tool: Snap', null);
        removeById('snapDB');

        var snapMenu = document.createElement('div');
        snapMenu.style = `text-snap:left; font-size:12px; position:absolute; right:52px; top:${evt.y+24}px; width:auto; padding:6px; border:1px solid rgb(190,190,190); border-radius:8px; background:white;`;
        document.body.append(snapMenu);
        snapMenu.id = 'snapDB';

        var desObjPosDDLR = document.createElement('select');
        desObjPosDDLR.style = `margin:4px;outline:none;`;
        ['center', 'left', 'right'].forEach((opt) => {
            var option = document.createElement('option');
            desObjPosDDLR.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        var desObjPosDDUD = document.createElement('select');
        desObjPosDDUD.style = `margin:4px;outline:none;`;
        ['center', 'top', 'bottom'].forEach((opt) => {
            var option = document.createElement('option');
            desObjPosDDUD.append(option);
            option.innerText = opt;
            option.value = opt[0];
        });

        snapMenu.append(document.createTextNode('Object Position'));
        snapMenu.append(document.createElement('br'));
        snapMenu.append(desObjPosDDLR);
        snapMenu.append(desObjPosDDUD);
        snapMenu.append(document.createElement('hr'));

        Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 && ['minorGrid', 'majorGrid'].indexOf(x.id) == -1 }).forEach((x) => {
            x.addEventListener('click', () => {
                if (activeTool == 'snap') {
                    if (refObj && x != refObj) {
                        snapToPath(x, refObj, `${desObjPosDDLR.value}${desObjPosDDUD.value}`);
                    } else {
                        refObj = x;
                    };
                };
            });
        });

        bBoxReqdTools.push('snap');
    });
})();

(() => {
    const arrayIcon = document.createElement('div');
    arrayIcon.setAttribute('class', 'exIcon');

    const arrayIconSvg = document.createElementNS(ns, 'svg');
    arrayIconSvg.setAttribute('viewBox', '0 0 1 1');
    arrayIconSvg.setAttribute('width', '100%');
    arrayIconSvg.setAttribute('height', '100%');

    const arrayPath = document.createElementNS(ns, 'path');
    arrayPath.setAttribute('fill', 'white');
    arrayPath.setAttribute('stroke', 'rgb(90,90,90)');
    arrayPath.setAttribute('stroke-width', '0.05');
    arrayPath.setAttribute('d', 'M 0.2 0.2 l 0.2 0 0 0.2 -0.2 0 z M 0.6 0.2 l 0.2 0 0 0.2 -0.2 0 z M 0.6 0.6 l 0.2 0 0 0.2 -0.2 0 z M 0.2 0.6 l 0.2 0 0 0.2 -0.2 0 z');

    arrayIconSvg.append(arrayPath);
    arrayIcon.append(arrayIconSvg);
    document.getElementById('extensionMenu').append(arrayIcon);

    addToolTip(arrayIcon, 'Array', 'left');

    arrayIcon.addEventListener('click', (evt) => {
        pressEsc();
        activeTool = 'array';
        openActionMsg('Active Tool: Array', null);
        removeById('arrayDB');

        var arrayMenu = document.createElement('div');
        arrayMenu.style = `text-array:left; font-size:12px; position:absolute; right:52px; top:${evt.y+24}px; width:auto; padding:6px; border:1px solid rgb(190,190,190); border-radius:8px; background:white;`;
        document.body.append(arrayMenu);
        arrayMenu.id = 'arrayDB';

        var arrayCountIn = document.createElement('input');
        arrayCountIn.setAttribute('type', 'number');
        arrayCountIn.setAttribute('step', '1');
        arrayCountIn.setAttribute('value', '10');
        arrayCountIn.setAttribute('min', '2');
        arrayCountIn.setAttribute('max', '100');
        arrayCountIn.style = 'margin-left:12px;width:52px;outline:none;';

        var arrayClosedPath = document.createElement('select');
        arrayClosedPath.style = `margin-left:12px;outline:none;`;
        ['auto', 'true', 'false'].forEach((opt) => {
            var option = document.createElement('option');
            arrayClosedPath.append(option);
            option.innerText = opt;
            option.value = opt;
        });

        arrayMenu.append(document.createTextNode('Count'));
        arrayMenu.append(arrayCountIn);
        arrayMenu.append(document.createElement('hr'));
        arrayMenu.append(document.createTextNode('Closed'));
        arrayMenu.append(arrayClosedPath);
        arrayMenu.append(document.createElement('hr'));

        Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 && ['minorGrid', 'majorGrid'].indexOf(x.id) == -1 }).forEach((x) => {
            x.addEventListener('click', () => {
                if (activeTool == 'array') {
                    if (refObj && x != refObj) {
                        arrayOverPath(refObj, x, arrayCountIn.value, arrayClosedPath.value);
                    } else {
                        refObj = x;
                    };
                };
            });
        });

        bBoxReqdTools.push('array');
    });
})();

(() => {
    const maskIcon = document.createElement('div');
    maskIcon.setAttribute('class', 'exIcon');

    const maskIconSvg = document.createElementNS(ns, 'svg');
    maskIconSvg.setAttribute('viewBox', '0 0 1 1');
    maskIconSvg.setAttribute('width', '100%');
    maskIconSvg.setAttribute('height', '100%');

    const maskPath = document.createElementNS(ns, 'path');
    maskPath.setAttribute('fill', 'rgb(220,220,220)');
    maskPath.setAttribute('stroke', 'rgb(90,90,90)');
    maskPath.setAttribute('stroke-width', '0.05');
    maskPath.setAttribute('fill-rule', 'evenodd');
    maskPath.setAttribute('d', 'M 0.2 0.2 0.8 0.2 0.8 0.8 0.2 0.8 z M 0.4 0.4 0.6 0.4 0.6 0.6 0.4 0.6 z');

    maskIconSvg.append(maskPath);
    maskIcon.append(maskIconSvg);
    document.getElementById('extensionMenu').append(maskIcon);

    addToolTip(maskIcon, 'Mask', 'left');

    maskIcon.addEventListener('click', () => {
        pressEsc();
        activeTool = 'mask';
        openActionMsg('Active Tool: Mask', null);

        Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 && ['minorGrid', 'majorGrid'].indexOf(x.id) == -1 }).forEach((x) => {
            x.addEventListener('click', () => {
                if (activeTool == 'mask') {
                    if (refObj && x != refObj) {
                        maskOnPath(x, refObj);
                        refObj = null;
                    } else {
                        refObj = x;
                    };
                };
            });
        });

        bBoxReqdTools.push('mask');
    });
})();

(() => {
    const mergeIcon = document.createElement('div');
    mergeIcon.setAttribute('class', 'exIcon');

    const mergeIconSvg = document.createElementNS(ns, 'svg');
    mergeIconSvg.setAttribute('viewBox', '0 0 1 1');
    mergeIconSvg.setAttribute('width', '100%');
    mergeIconSvg.setAttribute('height', '100%');

    const mergePath = document.createElementNS(ns, 'path');
    mergePath.setAttribute('fill', 'white');
    mergePath.setAttribute('stroke', 'rgb(90,90,90)');
    mergePath.setAttribute('stroke-width', '0.05');
    mergePath.setAttribute('d', 'M 0.1 0.1 A 0.4 0.4 0 0 0 0.9 0.1 A 0.4 0.4 0 0 0.9 0.9 A 0.4 0.4 0 0 0 0.1 0.9 A 0.4 0.4 0 0 0 0.1 0.1');

    mergeIconSvg.append(mergePath);
    mergeIcon.append(mergeIconSvg);
    document.getElementById('extensionMenu').append(mergeIcon);

    addToolTip(mergeIcon, 'Merge', 'left');

    mergeIcon.addEventListener('click', () => {
        pressEsc();
        activeTool = 'merge';
        openActionMsg('Active Tool: Merge', null);

        Array.from(svg.childNodes).filter((x) => { return ['defs', 'style'].indexOf(x.tagName) == -1 && ['minorGrid', 'majorGrid'].indexOf(x.id) == -1 }).forEach((x) => {
            x.addEventListener('click', () => {
                if (activeTool == 'merge') {
                    if (refObj && x != refObj) {
                        mergePaths(x, refObj);
                    } else {
                        refObj = x;
                    };
                };
            });
        });

        bBoxReqdTools.push('merge');
    });
})();

document.addEventListener('keydown', (e) => {
    if (e.key = 'Escape') {
        refObj = null;
        removeById('alignDB');
        removeById('snapDB');
        removeById('arrayDB');
    };
});

const snapToPath = (obj, path, mode = 'cc') => {
    var bbBox = obj.getBBox();
    if (!obj.getAttribute('transform')) { obj.setAttribute('transform', 'translate(0,0)') }
    if (bbBox && path.getTotalLength) {
        var x = bbBox.x;
        var y = bbBox.y;
        if (mode[1] == 'b') { y += bbBox.height; } else if (mode[1] == 'c') { y += bbBox.height / 2 };
        if (mode[0] == 'r') { x += bbBox.width; } else if (mode[0] == 'c') { x += bbBox.width / 2 };
        var pts = [];
        var m = path.getCTM();
        for (i = 0; i <= path.getTotalLength(); i += minorGridSeparation) {
            pts.push(path.getPointAtLength(i));
        };
        var dists = pts.map((X) => { return Math.hypot(X.x - x, X.y - y) });
        var minPt = pts[dists.indexOf(Math.min(...dists))];
        moveObject(obj, minPt.x - x,minPt.y - y);
    };
};

const alignObject = (obj, ref, mode = ['cc', 'cc']) => {
    if (obj.getBBox && ref.getBBox) {
        if (!obj.getAttribute('transform')) { obj.setAttribute('transform', 'translate(0,0)') }
        var rbb = ref.getBoundingClientRect();
        var dbb = obj.getBoundingClientRect();
        var rX = rbb.x;
        var rY = rbb.y;
        var dX = dbb.x;
        var dY = dbb.y;
        if (mode[0][0] == 'r') { rX += rbb.width } else if (mode[0][0] == 'c') { rX += rbb.width / 2 };
        if (mode[0][1] == 'b') { rY += rbb.height } else if (mode[0][1] == 'c') { rY += rbb.height / 2 };
        if (mode[1][0] == 'r') { dX += dbb.width } else if (mode[1][0] == 'c') { dX += dbb.width / 2 };
        if (mode[1][1] == 'b') { dY += dbb.height } else if (mode[1][1] == 'c') { dY += dbb.height / 2 };
        moveObject(obj, (rX - dX) / svgUnits, (rY - dY) / svgUnits);
    }
};

const arrayOverPath = (obj, path, no = 10, closed = 'auto') => {
    if (closed == 'auto') {
        closed = !(['ellipse', 'rect'].indexOf(path.tagName) == -1);
    } else {
        closed = closed == 'true';
    };
    var bbBox = obj.getBBox();
    no = Math.max(2, Math.min(no, 100));
    if (!obj.getAttribute('transform')) { obj.setAttribute('transform', 'translate(0,0)') }
    if (bbBox && path.getTotalLength) {
        var x = bbBox.x + 0.5 * bbBox.width;
        var y = bbBox.y + 0.5 * bbBox.height;
        var pt0 = path.getPointAtLength(0);
        var tobj = copyObject(obj, pt0.x - x, pt0.y - y);
        tobj.id = `arrayParent${Math.round(Math.random()*1000)}`;
        var href = `#${tobj.id}`;
        var step = path.getTotalLength() / (no - 1);
        var limit = closed ? path.getTotalLength() - step : path.getTotalLength();
        for (i = step; i <= limit; i += step) {
            var pt = path.getPointAtLength(i);
            addObject('use', { 'href': href, 'x': pt.x - pt0.x, 'y': pt.y - pt0.y });
        };
    };
};

const maskOnPath = (obj, ref) => {
    var maskObj = document.createElementNS(ns, 'mask');
    var maskObjid = `mask${Math.round(Math.random()*1000)}`;
    maskObj.id = maskObjid;
    maskObj.append(ref);
    pushToDefs(maskObj);
    obj.setAttribute('mask', `url(#${maskObjid})`);
};

const getScreenPoint = (point, matrix) => {
    var x = parseFloat(point[0]);
    var y = parseFloat(point[1]);
    var origin = svg.getAttribute('viewBox').split(' ');
    return [(matrix.a * x + matrix.c * y + matrix.e) / svgUnits + parseFloat(origin[0]),
        (matrix.b * x + matrix.d * y + matrix.f) / svgUnits + parseFloat(origin[1])
    ];
};

const mergePaths = (obj, ref) => {
    var TdObj = obj.getAttribute('d');
    var dRef = ref.getAttribute('d');
    if (dRef && TdObj) {
        var m = obj.getCTM();
        var points = [...TdObj.matchAll(/[A-Z]\s?[0-9|\s|.]+/g)];
        var dObj = '';
        for (let x in points) {
            var pt = points[x];
            var ptList = pt[0].slice(1).split(/\s/).map((x) => { return parseFloat(x) }).filter((x) => { return x == 0 || x });
            var outPtList = [];
            if (ptList.length % 2 == 0) {
                for (i = 0; i < ptList.length; i += 2) {
                    outPtList.push(getScreenPoint([ptList[i], ptList[i + 1]], m).join(' '));
                }
            } else if (ptList.length == 7) {
                outPtList = [ptList.slice(0, 2).join(' '), ptList.slice(2, 5).join(' '), getScreenPoint([ptList[5], ptList[6]], m).join(' ')];
            }
            var index = pt.index;
            dObj += pt[0][0] + '\n' + outPtList.join('\n') + '\n' + TdObj.slice(index + pt[0].length, index + pt[0].length + points[x + 1] ? points[x + 1].index : 0);
        };
        ref.setAttribute('d', `${dRef}\n${dObj}`);
        obj.remove();
    };
};