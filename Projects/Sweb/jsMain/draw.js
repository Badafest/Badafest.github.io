var drawLineIcon = document.getElementById('drawLine');
var drawPathIcon = document.getElementById('drawPath');
var drawArcIcon = document.getElementById('drawArc');
var drawFreeIcon = document.getElementById('drawFree');
var drawEllipseIcon = document.getElementById('drawEllipse');
var drawRectIcon = document.getElementById('drawRect');
var drawShapeIcon = document.getElementById('drawShape');
var drawTextIcon = document.getElementById('drawText');
var drawTexIcon = document.getElementById('drawTex');
var drawImgIcon = document.getElementById('drawImg');
var activeObj = null;
var imgUploadLink = null;
var texItem = null;
var drawFree = false;
var freePathPoints = [];
var addObjectIcon = document.getElementById('addObject');
var attPaintIcon = document.getElementById('attPainter');
var editObjIcon = document.getElementById('edit');
var groupIcon = document.getElementById('group');
var gObjs = [];
var lastClickedIcon = null;

const getFillColor = () => {
    return fillColorIcon.value;
};

const getStrokeColor = () => {
    return strokeColorIcon.value;
};

const getStrokeWidth = () => {
    return document.getElementById('strokeValueOutput').innerHTML;
};

var clickedCoordinates = [];

const editObject = (event, object) => {
    if (activeTool != null) { return 0 };
    removeById('editTable');
    if (currMode == 'edit') {
        if (event.ctrlKey) {
            if (object.tagName == 'use') {
                Array.from(svg.childNodes).filter((x) => { return x.tagName == 'use' && x.getAttribute('href') == object.getAttribute('href') }).forEach((x) => { x.remove(); })
            }
            object.remove();
            removeById('boundingBox');
            Array.from(svg.getElementsByClassName('animation')).forEach((x) => {
                if (x.getAttribute('href').slice(1) == object.id) {
                    x.remove();
                };
            });
            if ([undefined, null].indexOf(document.getElementById('timeLine')) == -1) {
                timeLine();
            };
        } else if (event.shiftKey) {
            editPath(object);
        } else {
            var attIns = [];
            var attEdits = [];
            var editTable = document.createElement('div');
            editTable.id = 'editTable';
            editTable.style.left = `${event.clientX}px`;
            editTable.style.top = `${event.clientY}px`;
            var addButton = document.createElement('button');
            addButton.innerHTML = 'ADD';
            var pushButton = document.createElement('button');
            pushButton.innerHTML = '&#8659';
            pushButton.style.fontSize = '16px';
            pushButton.style.width = '26px';
            editTable.append(pushButton);
            pushButton.addEventListener('click', () => { sendBackward(object) });
            var pullButton = document.createElement('button');
            pullButton.innerHTML = '&#8657';
            pullButton.style.fontSize = '16px';
            pullButton.style.width = '26px';
            editTable.append(pullButton);
            pullButton.addEventListener('click', () => { sendForward(object) });
            var pushToDefsButton = document.createElement('button');
            pushToDefsButton.innerHTML = '&#8690';
            pushToDefsButton.style.width = '26px';
            editTable.append(pushToDefsButton);
            pushToDefsButton.addEventListener('click', () => { pushToDefs(object) });
            editTable.append(addButton);
            var attributes = object.getAttributeNames();
            for (x of attributes) {
                if (['href', 'style', 'class'].indexOf(x) == -1) {
                    var attEdit = document.createElement('div');
                    attEdit.setAttribute('class', 'attEdit');
                    var label = document.createTextNode(x);
                    var attIn = document.createElement('div');
                    attIn.id = x;
                    attIn.setAttribute('class', 'attribute');
                    attIn.setAttribute('contentEditable', 'true');
                    attIn.innerText = object.getAttribute(x);
                    attEdit.append(label);
                    attEdit.append(attIn);
                    editTable.append(attEdit);
                    attIns.push(attIn);
                    attEdits.push(attEdit);
                };
            };
            attEdits.forEach((attEdit) => {
                attEdit.onclick = (event) => {
                    if (event.ctrlKey) {
                        object.removeAttribute(attEdit.innerText.split('\n')[0]);
                        attEdit.remove();
                    };
                };
            });
            attIns.forEach((attIn) => {
                attIn.oninput = () => {
                    object.setAttribute(attIn.id, attIn.innerText);
                    if (object.tagName == 'text' && attIn.id == 'x') {
                        object.childNodes.forEach((x) => {
                            x.setAttribute('x', attIn.innerText);
                        })
                    };
                    if (object.tagName == 'text' && attIn.id == 'y') {
                        object.childNodes.forEach((x) => {
                            x.setAttribute('y', parseFloat(attIn.innerText) + Array.from(object.childNodes).indexOf(x) * parseFloat(object.getAttribute('font-size')));
                        })
                    };
                    if (attIn.id == 'scene') {
                        initScenes();
                    };
                };
            });
            if (object.tagName == 'text') {
                var textContent = document.createElement('div');
                textContent.setAttribute('class', 'attEdit');
                var textIn = document.createElement('div');
                textIn.setAttribute('class', 'attribute');
                textIn.setAttribute('contentEditable', 'true');
                textIn.innerText = getTextContent(object);
                textContent.append(document.createTextNode('text'));
                textContent.append(textIn);
                editTable.prepend(textContent);
                textIn.oninput = () => {
                    object.innerHTML = '';
                    addTextContent(object, textIn.innerText);
                };
            };
            addButton.onclick = () => {
                var attEditTemp = document.createElement('div');
                attEditTemp.setAttribute('class', 'attEdit');
                var labelTemp = document.createElement('p');
                labelTemp.innerText = 'name';
                labelTemp.setAttribute('contentEditable', 'true');
                labelTemp.style.outline = 'none';
                labelTemp.style.height = '17px';
                labelTemp.style.width = '80px';
                labelTemp.style.margin = '0px';
                labelTemp.style.textAlign = 'left';
                var attInTemp = document.createElement('div');
                attInTemp.setAttribute('class', 'attribute');
                attInTemp.setAttribute('contentEditable', 'true');
                attInTemp.innerText = 'value';
                attEditTemp.append(labelTemp);
                attEditTemp.append(attInTemp);
                addButton.after(attEditTemp);
                attInTemp.oninput = () => {
                    attInTemp.id = labelTemp.textContent;
                    object.setAttribute(attInTemp.id, attInTemp.innerText);
                };
                attEditTemp.onclick = (event) => {
                    if (event.ctrlKey) {
                        object.removeAttribute(attEditTemp.innerText.split('\n')[0]);
                        attEditTemp.remove();
                    };
                };
            };
            document.body.append(editTable);
            addToolTip(editTable, 'Edit and Add Attributes', 'top');
            addToolTip(pushButton, 'Send Backward', 'top');
            addToolTip(pullButton, 'Bring Forward', 'top');
            addToolTip(pushToDefsButton, 'Push to defs<br>[Hides from View]', 'top');
            editTable.style.height = `${Math.min(editTable.offsetHeight, workingArea.offsetTop + workingArea.offsetHeight - editTable.offsetTop - 10)}px`;
        };
    };
};

const addObject = (type, attributes, textContent = '') => {
    var obj = document.createElementNS(ns, type);

    obj.setAttribute('fill', getFillColor());
    obj.setAttribute('stroke', getStrokeColor());
    obj.setAttribute('stroke-width', getStrokeWidth());
    if (defaultProperties.strokeDashArray.length) {
        obj.setAttribute('stroke-dasharray', defaultProperties.strokeDashArray);
        if (defaultProperties.strokeDashOffset.length) {
            obj.setAttribute('stroke-dashoffset', defaultProperties.strokeDashOffset);
        };
    };
    if (defaultProperties.strokeLineJoin != 'miter') { obj.setAttribute('stroke-linejoin', defaultProperties.strokeLineJoin) };
    if (defaultProperties.strokeLineCap != 'butt') { obj.setAttribute('stroke-linecap', defaultProperties.strokeLineCap) };
    if (defaultProperties.nonScalingStroke) { obj.setAttribute('vector-effect', 'non-scaling-stroke') };
	if (defaultProperties.startMarker!='none'){obj.setAttribute('marker-start',`url(#startMarker${defaultProperties.startMarker})`)};
	if (defaultProperties.midMarker!='none'){obj.setAttribute('marker-mid',`url(#midMarker${defaultProperties.midMarker})`)};
	if (defaultProperties.endMarker!='none'){obj.setAttribute('marker-end',`url(#endMarker${defaultProperties.endMarker})`)};
    obj.setAttribute('opacity', 1);
    obj.setAttribute('scene', activeScene);

    for (x in attributes) {
        obj.setAttribute(x.replaceAll('_', ':'), attributes[x]);
    }
    obj.innerHTML = textContent;
    svg.append(obj);
    if (obj.getBBox && (obj.getBBox().width + obj.getBBox().height) == 0 && obj.tagName!='text') {
        obj.remove();
    } else {
        obj.addEventListener('click', (event) => { editObject(event, obj) });
    }
    obj.addEventListener('mouseenter', () => { drawBoundingBox(obj); });
    obj.addEventListener('mouseout', () => { removeById('boundingBox'); });
    return obj;
};

var bBoxReqdTools = [null, 'transform', 'painter', 'group', 'gradient', 'animate', 'addObj'];
const drawBoundingBox = (obj) => {
    removeById('boundingBox');
    var bbox = obj.getBoundingClientRect();
    var svgBBox = svg.getBoundingClientRect();
    var origin = svg.getAttribute('viewBox').split(' ').slice(0, 2);
    var strk = 1 / svgUnits;
    var xmin = (parseFloat(bbox.x) - parseFloat(svgBBox.x) - 10) * strk + parseFloat(origin[0]);
    var width = (parseFloat(bbox.width) + 20) * strk;
    var ymin = (parseFloat(bbox.y) - parseFloat(svgBBox.y) - 10) * strk + parseFloat(origin[1]);
    var height = (parseFloat(bbox.height) + 20) * strk;
    if (bBoxReqdTools.indexOf(activeTool) != -1) {
        var boundingBox = document.createElementNS(ns, 'path');
        boundingBox.id = 'boundingBox';
        boundingBox.setAttribute('d', `M ${xmin} ${ymin} l ${width} 0 0 ${height} -${width} 0 z M ${xmin + strk*3} ${ymin + strk*3} l ${width - strk*6} 0 0 ${height - strk*6} -${width-strk*6} 0 z`)
        boundingBox.setAttribute('stroke-width', `${strk}`);
        svg.append(boundingBox);
    };
    return boundingBox;
};

addObjectIcon.addEventListener('click', (event) => {
    pressEsc();
    lastClickedIcon = addObjectIcon;
    activeTool = 'addObj';
    stopWaitForPoint();
    removeById('objIn');
    var objIn = document.createElement('div');
    objIn.id = 'objIn';
    objIn.style.left = `${event.clientX - 55}px`;
    objIn.style.top = `${event.clientY + 25}px`;
    var typeIn = document.createElement('div');
    typeIn.setAttribute('contentEditable', 'true');
    typeIn.id = 'typeIn';
    var innerTextIn = document.createElement('div');
    innerTextIn.setAttribute('contentEditable', 'true');
    innerTextIn.id = 'innerTextIn';
    var attrIn = document.createElement('div');
    attrIn.setAttribute('contentEditable', 'true');
    attrIn.id = 'attrIn';
    attrIn.style.paddingLeft = '3px';
    objIn.append(document.createTextNode('Type'));
    objIn.append(typeIn);
    objIn.append(document.createTextNode('Inner Text'));
    objIn.append(innerTextIn);
    objIn.append(document.createTextNode('Attributes JSON'));
    objIn.append(attrIn);
    var okButton = document.createElement('button');
    okButton.innerText = 'ADD';
    objIn.append(okButton);
    document.body.append(objIn);
    attrIn.oninput = () => {
        removeById('tempObj');
        var attrs = attrIn.innerText.split(';\n');
        for (x in attrs) {
            attrs[x] = `"${attrs[x].split(':')[0]}":"${attrs[x].split(':')[1]}"`;
        };
        attrs = attrs.filter((x) => { return x.match('undefined') == null });
        var obj = addObject(typeIn.innerText, JSON.parse(('{' + attrs.join(',') + '}').replaceAll('\n', '\\n')), innerTextIn.innerText);
        obj.id = 'tempObj';
    };
    okButton.onclick = () => {
        var attrs = attrIn.innerText.split(';\n');
        for (x in attrs) {
            attrs[x] = `"${attrs[x].split(':')[0]}":"${attrs[x].split(':')[1]}"`;
        };
        attrs = attrs.filter((x) => { return x.match('undefined') == null });
        addObject(typeIn.innerText, JSON.parse(('{' + attrs.join(',') + '}').replaceAll('\n', '\\n')), innerTextIn.innerText);
    };
    svg.childNodes.forEach((x) => {
        if (['minorGrid', 'majorGrid'].indexOf(x.id) == -1) {
            x.addEventListener('click', () => {
                typeIn.innerText = x.tagName;
                innerTextIn.innerText = x.innerText || '';
                attrIn.innerText = '';
                x.getAttributeNames().forEach((atrNam) => {
                    if (['href', 'id', 'style', 'scene'].indexOf(atrNam) == -1) {
                        attrIn.innerText += `${atrNam}:${x.getAttribute(atrNam)};\n`;
                    };
                });
                attrIn.innerText.slice(0, attrIn.innerText.length - 1);
            });
        };
    });
    openActionMsg(`Active Tool: Add Object`, null);
});

attPaintIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = attPaintIcon;
    activeTool = 'painter';
    var objects = svg.childNodes;
    var attributes = {};
    var targetFound = false;
    const paintAttributes = (x) => {
        if (activeTool == 'painter') {
            if (!targetFound) {
                var names = x.getAttributeNames();
                names.forEach((t) => {
                    if (['x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'rx', 'ry', 'points', 'd', 'width', 'height', 'href', 'transform'].indexOf(t) == -1) {
                        attributes[t] = x.getAttribute(t);
                    };
                });
                targetFound = true;
            } else {
                for (t in attributes) {
                    x.setAttribute(t, attributes[t]);
                };
            };
        };
    };
    objects.forEach((x) => {
        if (x.id != 'minorGrid' && x.id != 'majorGrid') {
            x.addEventListener('click', () => { paintAttributes(x) });
        };
    });
    document.addEventListener('keydown', (event) => {
        if (event.key == 'Escape') {
            targetFound = false;
        };
    });
    openActionMsg(`Active Tool: Attribute Painter`, null);
});

editObjIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = editObjIcon;
    activeTool = 'transform';
    stopWaitForPoint();
    var objects = svg.childNodes;
    objects.forEach((x) => {
        if (x.id != 'majorGrid' && x.id != 'minorGrid') {
            x.addEventListener('click', () => { if (activeTool == 'transform') { transformObject(x) } });
        };
    });
    openActionMsg(`Active Tool: Transform`, null);
});

workingArea.addEventListener('click', (evt) => {
    clickedCoordinates.push(coordinates.innerHTML);
    if (activeTool == 'line' && clickedCoordinates.length > 1) {
        if (clickedCoordinates.length == 2) {
            var A = clickedCoordinates[0].split(', ');
            var B = clickedCoordinates[1].split(', ');
            activeObj = drawLine(A, B);
        } else {
            var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
            drawLine(A, null, activeObj);
        };
    } else if (activeTool == 'arc' && clickedCoordinates.length > 1) {
        if (clickedCoordinates.length == 2) {
            var A = clickedCoordinates[0].split(', ');
            var B = clickedCoordinates[1].split(', ');
            activeObj = drawArc(A, B);
        } else {
            var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
            var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
            drawArc(A, B, activeObj);
        };
    } else if (activeTool == 'path' && clickedCoordinates.length > 2 && (clickedCoordinates.length - 4) % 2 == 0) {
        if (clickedCoordinates.length == 4) {
            var A = clickedCoordinates[0].split(', ');
            var B = clickedCoordinates[1].split(', ');
            var C = clickedCoordinates[2].split(', ');
            var D = clickedCoordinates[3].split(', ');
            activeObj = drawPath(A, B, C, D);
        } else {
            var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
            var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
            drawPath(A, B, null, null, activeObj);
        };
    } else if (activeTool == 'free') {
        if (clickedCoordinates.length == 1) {
            drawFree = true;
            freePathPoints.push(clickedCoordinates[0].split(', '));

        } else if (clickedCoordinates.length == 2) {
            clickedCoordinates = [];
            drawFree = false;
            freePathPoints = [];
            document.getElementById('freePath').removeAttribute('id');

        }
    } else if (activeTool == 'ellipse' && clickedCoordinates.length > 1 && clickedCoordinates.length % 2 == 0) {
        var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        drawEllipse(A, B);
    } else if (activeTool == 'rect' && clickedCoordinates.length > 2 && clickedCoordinates.length % 3 == 0) {
        var A = clickedCoordinates[clickedCoordinates.length - 3].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
        var C = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        drawRect(A, B, C);
    } else if (activeTool == 'hrr' && clickedCoordinates.length > 2 && clickedCoordinates.length % 3 == 0) {
		var A = clickedCoordinates[clickedCoordinates.length - 3].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
		var C = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        drawHollowRoundedRectange(A, B, C);
    } else if (activeTool == 'ps' && clickedCoordinates.length > 2 && clickedCoordinates.length % 3 == 0) {
		var A = clickedCoordinates[clickedCoordinates.length - 3].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
		var C = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        drawPolygonStar(A, B, C);
    } else if (activeTool == 'text' && clickedCoordinates.length > 1 && clickedCoordinates.length % 2 == 0) {
        var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        drawText(A, B, 'Text');
    } else if (activeTool == 'tex') {
        removeById('editTable');
        var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        var inputBox = document.createElement('div');
        inputBox.id = 'editTable';
        inputBox.style = `position:absolute;padding-top:3px;font-size:14px;left:${evt.x}px;top:${evt.y-50}px;min-width:80px;min-height:20px;width:fit-content;border:1px solid rgb(110,110,110);outline:none`;
        inputBox.setAttribute('contenteditable', 'true');
        inputBox.oninput = () => {
            if (texItem != null) { texItem.remove(); }
            texItem = drawTex(A, inputBox.innerText);
        }
        document.body.append(inputBox);
    } else if (activeTool == 'img' && clickedCoordinates.length == 2) {
        var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
        var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
        clickedCoordinates = [];
        drawImage(A, B, imgUploadLink);
    };
});

workingArea.addEventListener('mousemove', () => {
    removeById('tempObj');
    if (clickedCoordinates.length > 0) {
        if (activeTool == 'line') {
            var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
            var B = coordinates.innerText.split(', ');
            var tempLine = drawLine(A, B);
            tempLine.id = 'tempObj';
        } else if (activeTool == 'arc') {
            var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
            var B = coordinates.innerText.split(', ');
            var tempArc = drawArc(A, B);
            tempArc.id = 'tempObj';
        } else if (activeTool == 'path') {
            if (clickedCoordinates.length == 1) {
                var A = clickedCoordinates[0].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempLine = drawLine(A, B);
                tempLine.id = 'tempObj';
            } else if (clickedCoordinates.length == 2) {
                var A = clickedCoordinates[0].split(', ');
                var B = clickedCoordinates[1].split(', ');
                var C = coordinates.innerText.split(', ');
                var tempLine = drawPath(A, B, C, C);
                tempLine.id = 'tempObj';
            } else if (clickedCoordinates.length == 3) {
                var A = clickedCoordinates[0].split(', ');
                var B = clickedCoordinates[1].split(', ');
                var C = clickedCoordinates[2].split(', ');
                var D = coordinates.innerText.split(', ');
                var tempLine = drawPath(A, B, C, D);
                tempLine.id = 'tempObj';
            } else if ((clickedCoordinates.length - 4) % 2 == 0) {
                if (clickedCoordinates.length == 4) {
                    var A = clickedCoordinates[1].split(', ');
                } else {
                    var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
                }
                var B = coordinates.innerText.split(', ');
                var tempLine = drawLine(A, B);
                tempLine.id = 'tempObj';
            } else {
                if (clickedCoordinates.length == 5) {
                    var A = clickedCoordinates[1].split(', ');
                    var C = clickedCoordinates[3].split(', ');
                } else {
                    var A = clickedCoordinates[clickedCoordinates.length - 3].split(', ');
                    var C = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
                }
                var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var C = [2 * parseFloat(A[0]) - parseFloat(C[0]), 2 * parseFloat(A[1]) - parseFloat(C[1])];
                var D = coordinates.innerText.split(', ');
                var tempLine = drawPath(A, B, C, D);
                tempLine.id = 'tempObj';
                tempLine.style.fill = 'none';
            };
        } else if (activeTool == 'free' && drawFree) {
            var newPoint = coordinates.innerText.split(', ');
            var lastPoint = freePathPoints[freePathPoints.length - 1];
            if (Math.hypot(newPoint[0] - lastPoint[0], newPoint[1] - lastPoint[1]) * svgUnits > smoothFreePathVal) {
                freePathPoints.push(coordinates.innerText.split(', '));
                if (freePathPoints.length == 4 && (document.getElementById('freePath') == null || document.getElementById('freePath') == undefined)) {
                    var freePath = drawPath(freePathPoints[0], freePathPoints[3], freePathPoints[1], freePathPoints[2]);
                    freePath.id = 'freePath';
                } else if (freePathPoints.length > 4 && (freePathPoints.length - 4) % 2 == 0) {
                    drawPath(freePathPoints[freePathPoints.length - 1], freePathPoints[freePathPoints.length - 2], null, null, document.getElementById('freePath'));
                };
            };
        } else if (activeTool == 'ellipse') {
            if (clickedCoordinates.length % 2 == 1) {
                var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempEllipse = drawEllipse(A, B);
                tempEllipse.id = 'tempObj';
            };
        } else if (activeTool == 'rect') {
            if (clickedCoordinates.length % 3 == 1) {
                var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempRect = drawRect(A, B);
                tempRect.id = 'tempObj';
            } else if (clickedCoordinates.length % 3 == 2) {
                var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
                var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var C = coordinates.innerText.split(', ');
                var tempRect = drawRect(A, B, C);
                tempRect.id = 'tempObj';
            };
        } else if (activeTool == 'hrr') {
            if (clickedCoordinates.length % 3 == 1) {
                var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempRect = drawHollowRoundedRectange(A, B);
                tempRect.id = 'tempObj';
            } else if (clickedCoordinates.length % 3 == 2) {
                var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
                var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var C = coordinates.innerText.split(', ');
                var tempRect = drawHollowRoundedRectange(A, B, C);
                tempRect.id = 'tempObj';
            };
        } else if (activeTool == 'ps') {
            if (clickedCoordinates.length % 3 == 1) {
                var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempRect = drawPolygonStar(A, B);
                tempRect.id = 'tempObj';
            } else if (clickedCoordinates.length % 3 == 2) {
                var A = clickedCoordinates[clickedCoordinates.length - 2].split(', ');
                var B = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var C = coordinates.innerText.split(', ');
                var tempRect = drawPolygonStar(A, B, C);
                tempRect.id = 'tempObj';
            };
        } else if (activeTool == 'text') {
            if (clickedCoordinates.length % 2 == 1) {
                var A = clickedCoordinates[clickedCoordinates.length - 1].split(', ');
                var B = coordinates.innerText.split(', ');
                var tempText = drawText(A, B, 'Text');
                tempText.id = 'tempObj';
            };
        } else if (activeTool == 'img') {
            if (clickedCoordinates.length == 1) {
                var A = clickedCoordinates[0].split(', ');
                var B = coordinates.innerText.split(', ');
                image = drawImage(A, B, imgUploadLink);
                image.id = 'tempObj';
            };
        };
    };
});

groupIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = groupIcon;
    activeTool = 'group';
    svg.childNodes.forEach((x) => {
        if (x.id != 'majorGrid' && x.id != 'minorGrid') {
            x.addEventListener('click', (event) => {
                if (activeTool == 'group') {
                    if (event.ctrlKey) {
                        if (x.tagName == 'g') {
                            openActionMsg(`Ungrouped ${x.childNodes.length} items`);
                            ungroupItems(x);
                            activeTool = null;
                        };
                    } else {
                        if (gObjs.indexOf(x) == -1) { gObjs.push(x); };
                    };
                };
            });
        };
    });
    openActionMsg(`Active Tool: Group`, null);
});

const drawLine = (A, B = null, line = null) => {
    if (line == null) {
        attributes = {
            'points': `${A[0]} ${A[1]}\n${B[0]} ${B[1]}`
        };
        return addObject('polyline', attributes);
    } else {
        var points = line.getAttribute('points');
        line.setAttribute('points', points + `\n${A[0]} ${A[1]}`);
    };
};

const drawPath = (A, B, C = null, D = null, path = null) => {
    if (path == null) {
        attributes = {
            'd': `M\n${A[0]} ${A[1]}\nC\n${C[0]} ${C[1]}\n${D[0]} ${D[1]}\n${B[0]} ${B[1]}`
        };
        return addObject('path', attributes);
    } else {
        path.setAttribute('d', path.getAttribute('d') + `\nS\n${B[0]} ${B[1]}\n${A[0]} ${A[1]}`);
    };
};

const drawArc = (A, B, path = null) => {
    var radius = Math.round(dist([parseFloat(A[0]), parseFloat(A[1])], [parseFloat(B[0]), parseFloat(B[1])]) / 2);
    if (path == null) {
        attributes = {
            'd': `M\n${A[0]} ${A[1]}\nA\n${radius} ${radius}\n0 0 0\n${B[0]} ${B[1]}`
        };
        return addObject('path', attributes);
    } else {
        path.setAttribute('d', path.getAttribute('d') + `\nA\n${radius} ${radius}\n0 0 0\n${B[0]} ${B[1]}`);
    }
}

const drawEllipse = (A, B) => {
    attributes = {
        'cx': A[0],
        'cy': A[1],
        'rx': Math.abs(B[0] - A[0]),
        'ry': Math.abs(B[1] - A[1])
    };
    return addObject('ellipse', attributes);
};

const drawRect = (A, B, C = null) => {
    attributes = {
        'x': A[0] - Math.abs(B[0] - A[0]),
        'y': A[1] - Math.abs(B[1] - A[1]),
        'width': 2 * Math.abs(B[0] - A[0]),
        'height': 2 * Math.abs(B[1] - A[1])
    };
    if (C != null) {
        attributes['rx'] = Math.abs(C[0] - B[0]);
        attributes['ry'] = Math.abs(C[1] - B[1]);
    };
    return addObject('rect', attributes);
};

const drawText = (A, B, content = '') => {
    attributes = {
        'x': A[0],
        'y': A[1],
        'font-size': Math.round(Math.abs(A[1] - B[1]) * 100) / 100,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
    };
    text = addObject('text', attributes);
    addTextContent(text, content);
    return text;
};

const drawTex = (A, content = '') => {
    var x = parseFloat(A[0]);
    var y = parseFloat(A[1]);
    var texSvg = MathJax.tex2svg(String(content)).childNodes[0];
    texSvg.setAttribute('color', getStrokeColor());
    var fReader = new FileReader();
    fReader.readAsDataURL(new Blob([new XMLSerializer().serializeToString(texSvg)], { type: "image/svg+xml;charset=utf-8" }));
    fReader.onloadend = (event) => {
        texItem = drawImage(A, [x + parseFloat(texSvg.getAttribute('width')) * 12,
                y + parseFloat(texSvg.getAttribute('height')) * 10
            ],
            event.target.result);
    };
    // document.body.append(texBox);
    // texBox.style = 'padding:0;margin:0;width:fit-content;height:fit-content;outline:none';
    // var bbRec = texBox.getBoundingClientRect();
    // var texContainer = addObject('foreignObject', {
    //     'x': x,
    //     'y': y,
    //     'width': Math.ceil(bbRec.width),
    //     'height': Math.ceil(bbRec.height)
    // });
    // texContainer.append(texBox);
    // texContainer.setAttribute('color', texContainer.getAttribute('stroke'));
    // ['fill', 'stroke', 'stroke-width'].forEach((x) => { texContainer.removeAttribute(x); });
    // Array.from(texBox.getElementsByTagName('mjx-assistive-mml')).forEach((x) => { x.remove(); });
    // texContainer.style.overflow = 'visible';
};

const addTextContent = (text, content) => {
    var lines = content.split('\n');
    for (x = 0; x < lines.length; x++) {
        tspan = document.createElementNS(ns, 'tspan');
        tspan.setAttribute('x', text.getAttribute('x'));
        tspan.setAttribute('style', `font-family:${activeFont}`);
        tspan.setAttribute('y', parseFloat(text.getAttribute('y')) + x * parseFloat(text.getAttribute('font-size')));
        tspan.innerHTML = lines[x];
        text.append(tspan);
    }
};

const getTextContent = (text) => {
    tspans = text.childNodes;
    lines = '';
    for (x of tspans) {
        lines = lines + x.innerHTML + '\n'
    };
    return lines.slice(0, lines.length - 1);
};

const drawImage = (A, B, link) => {
    attributes = {
        'x': A[0],
        'y': A[1],
        'width': Math.abs(A[0] - B[0]),
        'height': Math.abs(A[1] - B[1]),
        'href': link
    }
    var image = addObject('image', attributes);
    ['fill', 'stroke', 'stroke-width'].forEach((x) => { image.removeAttribute(x) });
    return image;
};

drawLineIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawLineIcon;
    clickedCoordinates = [];
    activeTool = 'line';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Polyline`, null);
});

drawPathIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawPathIcon;
    clickedCoordinates = [];
    activeTool = 'path';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Path`, null);
});

drawArcIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawArcIcon;
    clickedCoordinates = [];
    activeTool = 'arc';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Arc Path`, null);
});

drawFreeIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawFreeIcon;
    clickedCoordinates = [];
    activeTool = 'free';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Free Path`, null);
});

drawEllipseIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawEllipseIcon;
    clickedCoordinates = [];
    activeTool = 'ellipse';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Ellipse`, null);
});

drawRectIcon.addEventListener('click', () => {
    pressEsc();
	lastClickedIcon = drawRectIcon;
    clickedCoordinates = [];
    activeTool = 'rect';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Rectangle`, null);
});

drawShapeIcon.addEventListener('click', () => {
	removeById('shapeToolbar');
	document.body.append(shapeToolBar);
});

drawTextIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawTextIcon;
    clickedCoordinates = [];
    activeTool = 'text';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: Text`, null);
});

drawTexIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawTexIcon;
    texItem = null;
    clickedCoordinates = [];
    activeTool = 'tex';
    removeById('tempObj');
    waitForPoint();
    openActionMsg(`Active Tool: LaTeX`, null);
});

drawImgIcon.addEventListener('click', () => {
    pressEsc();
    lastClickedIcon = drawImgIcon;
    removeById('imgUpload');
    removeById('tempObj');
    var imgUpload = document.createElement('input');
    imgUpload.type = 'file';
    imgUpload.accept = "image/*";
    imgUpload.id = 'imgUpload';
    imgUpload.click();
    clickedCoordinates = [];
    activeTool = 'img';
    var fReader = new FileReader();
    imgUpload.onchange = () => {
        fReader.readAsDataURL(imgUpload.files[0]);
        fReader.onloadend = (event) => {
            imgUploadLink = event.target.result;
            openActionMsg(`Active Tool: Image`, null);
        };
    };
    removeById('imgUpload');
    waitForPoint();
});

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        activeTool = null;
        activeObj = null;
        removeById('editTable');
        removeById('tempObj');
        removeById('objIn');
        removeById('imgUpload');
        removeById('freePath');
		freePath = null;
        drawFree = false;
        freePathPoints = [];
        gObjs = [];
        stopWaitForPoint();
        Array.from(document.getElementsByClassName('msgBox')).forEach((x) => { x.remove(); })
        openActionMsg(`Active Tool: Null`);
    } else if (event.key == 'Enter') {
        if (activeTool == 'group') {
            groupItems(gObjs);
            openActionMsg(`Grouped ${gObjs.length} items`);
            gObjs = [];
            activeTool = null;
        };
        if (!(document.getElementById('editTable') || document.getElementById('objIn')) && lastClickedIcon) {
			var tempCoords;
			if(clickedCoordinates.length){
				tempCoords = clickedCoordinates[clickedCoordinates.length-activeTool=='path'?2:1];
			};
			lastClickedIcon.click();
			clickedCoordinates=[tempCoords];	
		};
    };
});

const groupItems = (objs) => {
    var htmlText = '';
    for (x of objs) {
        htmlText += x.outerHTML;
        x.remove();
    };
    var g = addObject('g', {}, htmlText);
	for(let x in defaultProperties){
		g.removeAttribute(x);
	}
    return g;
};

const ungroupItems = (group) => {
    var objs = group.childNodes;
    var gAttDict = {};
    var gattNames = group.getAttributeNames();
    for (gattName of gattNames) {
        gAttDict[gattName] = group.getAttribute(gattName);
    };
    for (obj of objs) {
        var attDict = {...gAttDict };
        var attrNames = obj.getAttributeNames();
        for (attrName of attrNames) {
            attDict[attrName] = obj.getAttribute(attrName);
        };
        var tobj = addObject(obj.tagName, attDict, obj.innerHTML);
        if (tobj.tagName == 'g') {
            tobj.removeAttribute('fill');
            tobj.removeAttribute('stroke');
            tobj.removeAttribute('stroke-width');
        };
    };
    removeObjects(group);
    group.remove();
};

const removeObjects = (group) => {
    var objs = group.childNodes;
    objs.forEach((x) => {
        if (x.tagName == 'g') {
            removeObjects(x);
            x.remove();
        } else {
            x.remove();
        };
    });
};

const sendBackward = (object) => {
    objects = svg.childNodes;
    index = Array.from(objects).indexOf(object);
    minIndex = majorGridOn && minorGridOn ? 3 : majorGrid || minorGridOn ? 2 : 1;
    if (index > minIndex) {
        prevObject = objects[index - 1];
        svg.insertBefore(object, prevObject);
    };
};

const sendForward = (object) => {
    objects = svg.childNodes;
    index = Array.from(objects).indexOf(object);
    maxIndex = objects.length - 1;
    if (index < maxIndex) {
        nextObject = objects[index + 1];
        nextObject.after(object);
    };
};