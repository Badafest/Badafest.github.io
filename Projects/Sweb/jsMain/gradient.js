var gradientIcon = document.getElementById('gradientIcon');
var gradientBox = document.getElementById('gradientBox');
var gradCount = 0;
var svg = document.getElementById('svg');

const currGradient = () => document.getElementById('gradient').cloneNode(true);
const reAssignCurrGrad = () => {
    var toolGrad = document.getElementById(`gradient${gradCount}`).cloneNode(true);
    toolGrad.id = 'gradient';
    document.getElementById('gradient').remove();
    var toolDefs = gradientIcon.getElementsByTagName('defs')[0];
    toolDefs.append(toolGrad);
};

gradientIcon.addEventListener('click', (event) => {
    activeTool = 'gradient';
    if (event.ctrlKey) {
        openGradEditDialogBox(event);
    } else {
        openStopEditDialogBox(event);
    };
    var objects = svg.childNodes;
    objects.forEach((obj) => {
        if (obj.id != 'majorGrid' && obj.id != 'minorGrid') {
            obj.addEventListener('click', (evt) => {
                if (activeTool == 'gradient') {
                    if (evt.ctrlKey) {
                        obj.setAttribute('stroke', `url(#gradient${gradCount})`);
                    } else {
                        obj.setAttribute('fill', `url(#gradient${gradCount})`);
                    };
                };
            });
        };
    });
    openActionMsg('Click: Gradient to Fill<br>Ctrl+Click: Gradient to Stroke', null);
});

openStopEditDialogBox = (event) => {
    gradCount += 1;
    removeById('gradDiagBox');
    removeById('gradDiagEditBox');
    removeById('editTable');
    pallete.style.display = 'none';
    var gDB = document.createElementNS(ns, 'svg');
    gDB.setAttribute('id', 'gradDiagBox');
    gDB.setAttribute('viewBox', '0 0 100 100');
    gDB.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    var gradBoxMain = document.createElementNS(ns, 'rect');
    var currGrad = currGradient();
    var gradId = `gradient${gradCount}`;
    currGrad.setAttribute('id', gradId);
    var defsMain = svg.getElementsByTagName('defs')[0];
    if (svg.getElementById(gradId) == undefined || svg.getElementById(gradId) == null) {
        defsMain.append(currGrad);
    };
    gradBoxMain.setAttribute('fill', `url(#gradient${gradCount})`);
    gradBoxMain.setAttribute('x', '5');
    gradBoxMain.setAttribute('y', '5');
    gradBoxMain.setAttribute('width', '90');
    gradBoxMain.setAttribute('height', '90');
    gradBoxMain.setAttribute('rx', '2');

    var stops = Array.from(currGrad.getElementsByTagName('stop'));

    if (currGrad.tagName == 'linearGradient') {
        var xStartPer = parseFloat(currGrad.getAttribute('x1'));
        var xEndPer = parseFloat(currGrad.getAttribute('x2'));
        var yStartPer = parseFloat(currGrad.getAttribute('y1'));
        var yEndPer = parseFloat(currGrad.getAttribute('y2'));
    } else if (currGrad.tagName == 'radialGradient') {
        var xStartPer = parseFloat(currGrad.getAttribute('cx'));
        var yStartPer = parseFloat(currGrad.getAttribute('cy'));
        var radPer = parseFloat(currGrad.getAttribute('r'));
        var xEndPer = xStartPer + radPer;
        var yEndPer = yStartPer + radPer;
    }
    var gradLine = document.createElementNS(ns, 'line');
    var xStep = (xEndPer - xStartPer) / 100;
    var yStep = (yEndPer - yStartPer) / 100;
    gradLine.setAttribute('x1', (9 * xStartPer + 50) / 10);
    gradLine.setAttribute('x2', (9 * xEndPer + 50) / 10);
    gradLine.setAttribute('y1', (9 * yStartPer + 50) / 10);
    gradLine.setAttribute('y2', (9 * yEndPer + 50) / 10);
    gradLine.setAttribute('stroke', 'black');
    gradLine.setAttribute('stroke-width', '2.5');
    gradLine.setAttribute('style', 'cursor:pointer');
    gDB.append(gradLine);

    gradLine.addEventListener('click', (evt) => {
        stops = Array.from(currGrad.getElementsByTagName('stop'));
        var originX = parseFloat(gradBoxMain.getBoundingClientRect().x);
        var widthRec = parseFloat(gradBoxMain.getBoundingClientRect().width);
        var beginX = parseFloat(currGrad.getAttribute('x1'));
        var endX = parseFloat(currGrad.getAttribute('x2'));
        var pointX = parseFloat(evt.x);
        var offsetTemp = parseInt(((pointX - originX) / widthRec) * 100);
        var offsetTemp = 100 * (offsetTemp - beginX) / (endX - beginX);
        if (offsetTemp < 0) { offsetTemp = 0 };
        if (offsetTemp > 100) { offsetTemp = 100 };
        var startColor = stops[0].style.stopColor.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i).slice(1);
        var endColor = stops[stops.length - 1].style.stopColor.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i).slice(1);
        if (startColor[3] == undefined) { startColor[3] = 1 }
        if (endColor[3] == undefined) { endColor[3] = 1 }
        var redColorTemp = parseFloat(startColor[0]) + 0.01 * offsetTemp * (parseFloat(endColor[0]) - parseFloat(startColor[0]));
        var blueColorTemp = parseFloat(startColor[1]) + 0.01 * offsetTemp * (parseFloat(endColor[1]) - parseFloat(startColor[1]));
        var greenColorTemp = parseFloat(startColor[2]) + 0.01 * offsetTemp * (parseFloat(endColor[2]) - parseFloat(startColor[2]));
        var alphaColorTemp = parseFloat(startColor[3]) + 0.01 * offsetTemp * (parseFloat(endColor[3]) - parseFloat(startColor[3]));
        var tempStop = document.createElementNS(ns, 'stop');
        tempStop.setAttribute('offset', `${offsetTemp}%`);
        tempStop.style.stopColor = `rgba(${parseInt(redColorTemp)},${parseInt(blueColorTemp)},${parseInt(greenColorTemp)},${parseInt(alphaColorTemp)})`;
        for (stp of stops) {
            var thisOffPer = parseInt(stp.getAttribute('offset'));
            if (thisOffPer > offsetTemp) {
                currGrad.insertBefore(tempStop, stp);
                break;
            };
        };
        stops = Array.from(currGrad.getElementsByTagName('stop'));
        Array.from(document.getElementsByClassName('stopHandle')).forEach((stpHndl) => { stpHndl.remove(); });
        stops.forEach((stp) => { dummyStopFunction(stp) });
        reAssignCurrGrad();
    });

    const changeStopColor = (position, color) => {
        stops[position].style.stopColor = `rgba(${color})`;
        reAssignCurrGrad();
    };

    const dummyStopFunction = (stop) => {
        var offset = parseFloat(stop.getAttribute('offset'));
        var stopHandle = document.createElementNS(ns, 'rect');
        stopHandle.setAttribute('width', 6);
        stopHandle.setAttribute('height', 6);
        stopHandle.setAttribute('x', (9 * (xStartPer + offset * xStep) + 50) / 10 - 3);
        stopHandle.setAttribute('y', (9 * (yStartPer + offset * yStep) + 50) / 10 - 3);
        stopHandle.setAttribute('fill', stop.style.stopColor);
        stopHandle.setAttribute('stroke', 'black');
        stopHandle.setAttribute('style', 'cursor:pointer');
        stopHandle.setAttribute('id', `stop${stops.indexOf(stop)}`);
        stopHandle.setAttribute('class', 'stopHandle');
        gDB.append(stopHandle);
        stopHandle.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                var indexStop = parseInt(stopHandle.id.slice(4));
                console.log(indexStop);
                if (0 < indexStop && indexStop < (stops.length - 1)) {
                    console.log(stops.length - 1)
                    stops[indexStop].remove();
                    stops.splice(indexStop, 1);
                    Array.from(gDB.getElementsByClassName('stopHandle')).forEach((stpHndl) => {
                        stpHndl.remove();
                    });
                    stops.forEach((stop) => { dummyStopFunction(stop); });
                    reAssignCurrGrad();
                };
            } else {
                var currentColor = stopHandle.getAttribute('fill').match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i).slice(1);
                if (currentColor[3] == undefined) {
                    currentColor[3] = 1;
                };
                pallete.style.left = `calc(${event.x}px - 5%)`;
                pallete.style.display = 'block';
                redValue.value = currentColor[0];
                greenValue.value = currentColor[1];
                blueValue.value = currentColor[2];
                alphaValue.value = currentColor[3];
                rgbValue.innerHTML = `rgba(${currentColor})`;

                var sliders = [redValue, greenValue, blueValue, alphaValue];

                [0, 1, 2, 3].forEach((x) => {
                    sliders[x].oninput = () => {
                        currentColor[x] = sliders[x].value;
                        rgbValue.innerHTML = `rgba(${currentColor})`;
                        stopHandle.setAttribute('fill', `rgba(${currentColor})`);
                        changeStopColor(parseInt(stopHandle.id.slice(4)), currentColor);
                    }
                });

                rgbValue.oninput = () => {
                    var color = rgbValue.innerText.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i);
                    for (x = 0; x < 4; x++) {
                        if (color[x + 1] != undefined) {
                            sliders[x].value = parseFloat(color[x + 1]);
                            currentColor[x] = parseFloat(color[x + 1]);
                        };
                    };
                    stopHandle.setAttribute('fill', `rgba(${currentColor})`);
                    changeStopColor(parseInt(stopHandle.id.slice(4)), currentColor);
                };
            };
        });
    }

    stops.forEach((stop) => { dummyStopFunction(stop); });
    gDB.prepend(gradBoxMain);
    document.body.append(gDB);
};

openGradEditDialogBox = (event) => {
    var currGrad = currGradient();
    var gradId = `gradient${gradCount}`;
    currGrad.setAttribute('id', gradId);
    var defsMain = svg.getElementsByTagName('defs')[0];
    if (svg.getElementById(gradId) == undefined || svg.getElementById(gradId) == null) {
        defsMain.append(currGrad);
    };

    removeById('gradDiagBox');
    removeById('gradDiagEditBox');
    removeById('editTable');

    var workingGrad = document.getElementById(gradId);

    pallete.style.display = 'none';
    var gEDB = document.createElement('div');
    gEDB.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; height:11%; background:white; border:1px solid rgb(190,190,190); border-radius:5px; font-size:14px`);
    gEDB.id = 'gradDiagEditBox';
    document.body.append(gEDB);

    var typeInput = document.createElement('select');
    typeInput.setAttribute('id', 'typeOfGrad');
    typeInput.setAttribute('style', 'margin-top:5px; border:1px solid rgb(190,190,190); outline:none');
    var typeLabel = document.createElement('label');
    typeLabel.setAttribute('for', 'typeOfGrad');
    typeLabel.innerText = 'Type:   ';
    var options = ['linear', 'radial'];
    if (workingGrad.tagName == 'radialGradient') {
        options = ['radial', 'linear'];
    };
    options.forEach((option) => {
        var optElem = document.createElement('option');
        optElem.setAttribute('value', option);
        optElem.innerText = option;
        typeInput.append(optElem);
    });
    gEDB.append(typeLabel);
    gEDB.append(typeInput);
    gEDB.append(document.createElement('hr'));

    typeInput.oninput = () => {
        workingGrad = document.getElementById(gradId);
        var tempGrad = document.createElementNS(ns, `${typeInput.value}Gradient`);
        tempGrad.innerHTML = workingGrad.innerHTML;
        tempGrad.id = gradId;
        if (tempGrad.tagName == workingGrad.tagName) {
            workingGrad.getAttributeNames().forEach((attrName) => {
                tempGrad.setAttribute(attrName, workingGrad.getAttribute(attrName));
            });
        } else if (tempGrad.tagName == 'linearGradient') {
            tempGrad.setAttribute('x1', workingGrad.getAttribute('cx'));
            tempGrad.setAttribute('y1', workingGrad.getAttribute('cy'));
            tempGrad.setAttribute('x2', `${parseFloat(workingGrad.getAttribute('cx'))+
                                            parseFloat(workingGrad.getAttribute('r'))}%`);
            tempGrad.setAttribute('y2', `${parseFloat(workingGrad.getAttribute('cy'))+
                                            parseFloat(workingGrad.getAttribute('r'))}%`);
        } else {
            tempGrad.setAttribute('cx', workingGrad.getAttribute('x1'));
            tempGrad.setAttribute('cy', workingGrad.getAttribute('y1'));
            tempGrad.setAttribute('r', `${parseFloat(workingGrad.getAttribute('x2'))-
                                            parseFloat(workingGrad.getAttribute('x1'))}%`);
            tempGrad.setAttribute('fx', workingGrad.getAttribute('x1'));
            tempGrad.setAttribute('fy', workingGrad.getAttribute('y1'));
        }
        workingGrad.parentNode.replaceChild(tempGrad, workingGrad);
        reAssignCurrGrad();
    }

    var attrInput = document.createElement('button');
    attrInput.innerText = 'EDIT';
    attrInput.style.marginLeft = 0;
    gEDB.append(attrInput);
    attrInput.onclick = () => {
        workingGrad = document.getElementById(gradId);
        var editGradAttrDB = document.createElement('div');
        editGradAttrDB.append(document.createElement('hr'));
        editGradAttrDB.setAttribute('id', 'editTable');
        editGradAttrDB.setAttribute('style',
            `position:absolute; top:${event.y+10}px; left:${event.x}px; width:10%; background:white; border:1px solid rgb(190,190,190); border-radius:5px; font-size:14px`);
        document.body.append(editGradAttrDB);
        var attrNames = workingGrad.getAttributeNames();
        attrNames.forEach((attrName) => {
            var label = document.createElement('label');
            label.innerText = attrName + ' ';
            var attrInputField = document.createElement('input');
            attrInputField.setAttribute('class', 'attribute');
            attrInputField.setAttribute('id', attrName);
            attrInputField.style.width = '50%';
            attrInputField.value = workingGrad.getAttribute(attrName);
            editGradAttrDB.append(label);
            editGradAttrDB.append(attrInputField);
            editGradAttrDB.append(document.createElement('hr'));
            attrInputField.oninput = () => {
                workingGrad.setAttribute(attrInputField.id, attrInputField.value);
                reAssignCurrGrad();
            };
        });
    };
};

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        removeById('gradDiagBox');
        removeById('gradDiagEditBox');
        pallete.style.display = 'none';
    };
});