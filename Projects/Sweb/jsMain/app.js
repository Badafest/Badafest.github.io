var fillColor = '#ffffff';
var strokeColor = '#000000';
var strokeWidth = 0.5;
var strokeDashArray = '';
var strokeDashOffset = '';
var strokeLineCap = 'butt'; //butt|round|square
var strokeLineJoin = 'miter'; //miter|round|bevel
var nonScalingStroke = false;

var activeTool = null;

var fontIcon = document.getElementById('fonts');
fontIcon.addEventListener('click', (event) => {
    removeById('editTable');
    var fontBox = document.createElement('div');
    fontBox.setAttribute('style',
        `position:absolute; top:${event.y+10}px; left:${event.x}px; width:12%; max-height:21%; background:white; border:1px solid rgb(190,190,190); border-radius:5px`);
    fontBox.setAttribute('id', 'editTable');
    var fontDropDown = document.createElement('div');
    fontDropDown.style.fontSize = '14px';
    fontDropDown.style.padding = '2px';
    listOfFonts.sort().forEach((fontName) => {
        var option = document.createElement('p');
        option.style = 'border:0.25px solid rgb(110,110,110); margin:0; cursor:pointer';
        if (fontName == activeFont) {
            option.style.border = '2px solid black';
        }
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgb(90,90,90)';
            option.style.color = 'white';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'white';
            option.style.color = 'black';
        });
        option.addEventListener('click', (evt) => {
            if (evt.ctrlKey) {
                option.remove();
                listOfFonts = listOfFonts.filter((x) => { return x != option.innerText });
            } else {
                fontDropDown.childNodes.forEach((opt) => { opt.style.border = '0.25px solid rgb(110,110,110)' });
                option.style.border = '2px solid black';
                fontIcon.childNodes[1].style.fontFamily = fontName;
                activeFont = fontName;
            }
        });
        option.innerText = fontName;
        option.style.fontFamily = fontName;
        fontDropDown.append(option);
    });
    var customFontOption = document.createElement('p');
    customFontOption.style = 'border:0.25px solid rgb(110,110,110); margin:0; font-style:italic';
    customFontOption.innerText = 'Custom';
    customFontOption.setAttribute('contenteditable', 'true');
    fontDropDown.append(customFontOption);

    customFontOption.oninput = () => {
        customFontOption.style.fontFamily = customFontOption.innerText;
    };

    customFontOption.addEventListener('click', () => {
        if (listOfFonts.indexOf(customFontOption.innerText) == -1 && customFontOption.innerText != 'Custom') {
            listOfFonts.push(customFontOption.innerText);
            activeFont = customFontOption.innerText;
            fontIcon.childNodes[1].style.fontFamily = customFontOption.innerText;
            fontIcon.dispatchEvent(event);
        };
    })

    fontBox.append(fontDropDown);
    document.body.append(fontBox);

});

// var toolBar = document.getElementById('toolBar');
var workingArea = document.getElementById('workingArea');

var fillColorIcon = document.getElementById('fillColorIcon');
var strokeColorIcon = document.getElementById('strokeColorIcon');
var strokeWidthIcon = document.getElementById('strokes');
var strokeWidthValue = document.getElementById('strokeWidth');

var minorGridIcon = document.getElementById('minorGrids');
var majorGridIcon = document.getElementById('majorGrids');

var coordinates = document.getElementById('xyDisplay');

var moveXYBool = false;
var mouseX, mouseY;
var resetIcon = document.getElementById('resetSvg');

var svgUnits = 2;

var majorGrid;
var minorGrid;
var minorGridOn = false;
var majorGridOn = false;

var minorGridSeparation = 10;
var majorGridSeparation = 100;

const ns = "http://www.w3.org/2000/svg";

const initializeSvg = () => {
    removeById('svg');
    minorGridOn = majorGridOn = false;
    var height = workingArea.clientHeight;
    var width = workingArea.clientWidth;
    var svg = document.createElementNS(ns, 'svg');
    var defs = document.createElementNS(ns, 'defs');
    var style = document.createElementNS(ns, 'style');

    // minorGridPattern
    var minorGridPattern = document.createElementNS(ns, 'pattern');
    minorGridPattern.id = 'minorGridPattern';
    minorGridPattern.setAttribute('patternUnits', "userSpaceOnUse");
    minorGridPattern.setAttribute('width', `${minorGridSeparation}`);
    minorGridPattern.setAttribute('height', `${minorGridSeparation}`);

    var minorGrids = document.createElementNS(ns, 'polyline');
    minorGrids.id = 'minorGridLines';
    minorGrids.setAttribute('points', `${minorGridSeparation} 0, 0 0, 0 ${minorGridSeparation}`);
    minorGrids.setAttribute('stroke', 'rgb(200,200,200)');
    minorGrids.setAttribute('fill', 'none');
    minorGrids.setAttribute('stroke-width', 0.75 / svgUnits);
    minorGridPattern.append(minorGrids);
    defs.append(minorGridPattern);

    //minorGridBox
    minorGrid = document.createElementNS(ns, 'rect');
    minorGrid.id = 'minorGrid';
    minorGrid.setAttribute('x', '0');
    minorGrid.setAttribute('y', '0');
    minorGrid.setAttribute('width', '100%');
    minorGrid.setAttribute('height', '100%');
    minorGrid.setAttribute('stroke', 'none');
    minorGrid.setAttribute('fill', 'url(#minorGridPattern)');

    // majorGridPattern
    var majorGridPattern = document.createElementNS(ns, 'pattern');
    majorGridPattern.id = 'majorGridPattern';
    majorGridPattern.setAttribute('patternUnits', "userSpaceOnUse");
    majorGridPattern.setAttribute('width', `${majorGridSeparation}`);
    majorGridPattern.setAttribute('height', `${majorGridSeparation}`);

    var majorGrids = document.createElementNS(ns, 'polyline');
    majorGrids.id = 'majorGridLines';
    majorGrids.setAttribute('points', `${majorGridSeparation} 0, 0 0, 0 ${majorGridSeparation}`);
    majorGrids.setAttribute('stroke', 'rgb(200,200,200)');
    majorGrids.setAttribute('fill', 'none');
    majorGrids.setAttribute('stroke-width', 1.5 / svgUnits);
    majorGridPattern.append(majorGrids);
    defs.append(majorGridPattern);

    //majorGridBox
    majorGrid = document.createElementNS(ns, 'rect');
    majorGrid.id = 'majorGrid';
    majorGrid.setAttribute('x', '0');
    majorGrid.setAttribute('y', '0');
    majorGrid.setAttribute('width', '100%');
    majorGrid.setAttribute('height', '100%');
    majorGrid.setAttribute('stroke', 'none');
    majorGrid.setAttribute('fill', 'url(#majorGridPattern)');

    svg.id = 'svg';
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('viewBox', `${0} ${0} ${width/svgUnits} ${height/svgUnits}`);
    svg.setAttribute('canvasWidth', `${workingArea.clientWidth}px`);
    svg.setAttribute('canvasHeight', `${workingArea.clientHeight}px`);
    workingArea.append(svg);
    svg.append(defs);

    style.innerHTML = '*{\ntransform-box: fill-box;\ntransform-origin: center;\n}';
    svg.append(style);
};

const removeById = (id) => {
    if (document.getElementById(id) != null && document.getElementById(id) != undefined) {
        document.getElementById(id).remove();
    }
};

const changeFillColor = (newColor) => {
    fillColor = newColor;
    fillColorIcon.value = newColor;
    openActionMsg(`Fill Color: ${newColor}`);
}

const changeStrokeColor = (newColor) => {
    strokeColor = newColor;
    strokeColorIcon.value = newColor;
    openActionMsg(`Stroke Color: ${newColor}`);
}

const displayXY = (event) => {
    var x0 = parseFloat(document.getElementById('svg').getAttribute('viewBox').split(' ')[0]);
    var y0 = parseFloat(document.getElementById('svg').getAttribute('viewBox').split(' ')[1]);
    var x = Math.round((x0 + (event.clientX - workingArea.offsetLeft - workingArea.offsetParent.offsetLeft) / svgUnits) * 1000) / 1000;
    var y = Math.round((y0 + (event.clientY - workingArea.offsetTop - workingArea.offsetParent.offsetTop) / svgUnits) * 1000) / 1000;
    if (event.ctrlKey) {
        x = Math.round(x / minorGridSeparation) * minorGridSeparation;
        y = Math.round(y / minorGridSeparation) * minorGridSeparation;
    }
    if (event.altKey) {
        x = Math.round(x / majorGridSeparation) * majorGridSeparation;
        y = Math.round(y / majorGridSeparation) * majorGridSeparation;
    }
    coordinates.innerHTML = `${x}, ${y}`;
};

const moveXY = (moveXYBool, event) => {
    if (moveXYBool) {
        var deltaX = (event.clientX - mouseX) / svgUnits;
        var deltaY = (event.clientY - mouseY) / svgUnits;
        svg = document.getElementById('svg');
        var viewBox = svg.getAttribute('viewBox').split(' ');
        var x0 = parseFloat(viewBox[0]) - deltaX;
        var y0 = parseFloat(viewBox[1]) - deltaY;
        if (x0 > -1e6 && y0 > -1e6) {
            svg.setAttribute('viewBox', `${x0} ${y0} ${viewBox[2]} ${viewBox[3]}`);
            minorGrid.setAttribute('x', x0);
            majorGrid.setAttribute('x', x0);
            minorGrid.setAttribute('y', y0);
            majorGrid.setAttribute('y', y0);
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
    }
};

const changeMinorGridSeparation = (separation) => {
    minorGridSeparation = separation;
    minorGridPattern.setAttribute('width', separation);
    minorGridPattern.setAttribute('height', separation);
    minorGridLines.setAttribute('points', `${separation} 0, 0 0, 0 ${separation}`);
};

const changeMajorGridSeparation = (separation) => {
    majorGridSeparation = separation;
    majorGridPattern.setAttribute('width', separation);
    majorGridPattern.setAttribute('height', separation);
    majorGridLines.setAttribute('points', `${separation} 0, 0 0, 0 ${separation}`);
};

coordinates.addEventListener('click', (event) => {
    removeById('minSep');
    removeById('majSep');
    var minSep = document.createElement('input');
    minSep.setAttribute('type', 'number');
    minSep.setAttribute('min', '0.01');
    minSep.setAttribute('max', '10');
    minSep.setAttribute('step', '0.01');
    minSep.setAttribute('value', minorGridSeparation);
    var majSep = document.createElement('input');
    majSep.setAttribute('type', 'number');
    majSep.setAttribute('min', '0.1');
    majSep.setAttribute('max', '100');
    majSep.setAttribute('step', '0.1');
    majSep.setAttribute('value', majorGridSeparation);
    minSep.style.position = majSep.style.position = 'absolute';
    minSep.style.top = majSep.style.top = `${event.y - 20}px`;
    minSep.style.right = `98px`;
    majSep.style.right = `48px`;
    minSep.style.width = majSep.style.width = '50px';
    minSep.style.height = majSep.style.height = '20px';
    minSep.style.outline = majSep.style.outline = 'none';
    minSep.style.zIndex = majSep.style.zIndex = '10000';
    minSep.id = 'minSep';
    majSep.id = 'majSep';
    document.body.append(minSep);
    document.body.append(majSep);
    minSep.oninput = () => {
        if (minSep.value.length > 0) {
            changeMinorGridSeparation(parseFloat(minSep.value));
        };
    };
    majSep.oninput = () => {
        if (majSep.value.length > 0) {
            changeMajorGridSeparation(parseFloat(majSep.value));
        };
    };
});

strokeWidthValue.oninput = () => {
    strokeWidth = strokeWidthValue.value;
    document.getElementById('strokeValueOutput').innerHTML = strokeWidth;
    openActionMsg(`Stroke Width: ${strokeWidth}`);
};

strokeWidthIcon.addEventListener('click', (e) => {
    if (e.target != strokeWidthValue) {
        pressEsc();
        var strokeOptionsDB = document.createElement('div');
        strokeOptionsDB.style = `width:200px; font-size:14px; border:1px solid rgb(110,110,110);left:${e.x}px;top:${e.y+12}px;transform:translate(-50%)`;
        strokeOptionsDB.id = 'editTable';
        strokeOptionsDB.append(document.createElement('hr'));

        var strokeDashArrayIn = document.createElement('input');
        strokeDashArrayIn.id = 'attrIn';
        strokeOptionsDB.append(document.createTextNode('Dash Array'));
        strokeOptionsDB.append(strokeDashArrayIn);
        strokeOptionsDB.append(document.createElement('hr'));
        strokeDashArrayIn.oninput = () => { strokeDashArray = strokeDashArrayIn.value };

        var strokeDashOffsetIn = document.createElement('input');
        strokeDashOffsetIn.id = 'attrIn';
        strokeDashOffsetIn.setAttribute('type', 'number');
        strokeOptionsDB.append(document.createTextNode('Dash Offset'));
        strokeOptionsDB.append(strokeDashOffsetIn);
        strokeOptionsDB.append(document.createElement('hr'));
        strokeDashOffsetIn.oninput = () => { strokeDashOffset = strokeDashOffsetIn.value };

        var strokeLineJoinIn = document.createElement('select');
        ['miter', 'round', 'bevel'].forEach((opt) => {
            var option = document.createElement('option');
            option.innerText = opt;
            option.value = opt;
            strokeLineJoinIn.append(option);
        });
        strokeLineJoinIn.id = 'attrIn';
        strokeOptionsDB.append(document.createTextNode('Line Join'));
        strokeOptionsDB.append(document.createElement('br'));
        strokeOptionsDB.append(strokeLineJoinIn);
        strokeOptionsDB.append(document.createElement('hr'));
        strokeLineJoinIn.oninput = () => { strokeLineJoin = strokeLineJoinIn.value };

        var strokeLineCapIn = document.createElement('select');
        ['butt', 'round', 'square'].forEach((opt) => {
            var option = document.createElement('option');
            option.innerText = opt;
            option.value = opt;
            strokeLineCapIn.append(option);
        });
        strokeLineCapIn.id = 'attrIn';
        strokeOptionsDB.append(document.createTextNode('Line Cap'));
        strokeOptionsDB.append(document.createElement('br'));
        strokeOptionsDB.append(strokeLineCapIn);
        strokeOptionsDB.append(document.createElement('hr'));
        strokeLineCapIn.oninput = () => { strokeLineCap = strokeLineCapIn.value };

        var scaleStrokeIn = document.createElement('input');
        scaleStrokeIn.setAttribute('type', 'checkbox');
        strokeOptionsDB.append(document.createTextNode('Donot Scale Stroke'));
        strokeOptionsDB.append(scaleStrokeIn);
        strokeOptionsDB.append(document.createElement('hr'));
        scaleStrokeIn.oninput = () => { nonScalingStroke = scaleStrokeIn.checked };

        document.body.append(strokeOptionsDB);
        addToolTip(strokeOptionsDB, 'Stroke Properties');
        addToolTip(strokeDashArrayIn, 'Specify Dash Format Like "10 5 10"');
        addToolTip(strokeDashOffsetIn, 'Dash Array Offset');
    }
})

fillColorIcon.oninput = () => { changeFillColor(fillColorIcon.value) };

strokeColorIcon.oninput = () => { changeStrokeColor(strokeColorIcon.value) };

workingArea.addEventListener('click', (event) => {
    removeById('minSep');
    removeById('majSep');
    removeById('tempIn');
    removeById('colDiv');
    if ([majorGrid, minorGrid, svg].indexOf(event.target) != -1) {
        removeById('objIn');
        removeById('editTable');
        if (activeTool == 'addObj') { pressEsc(); };
    };
});

minorGridIcon.addEventListener('click', () => {
    svg = document.getElementById('svg');
    if (minorGridOn) {
        minorGrid.remove();
        minorGridIcon.style.opacity = 0.5;
    } else {
        svg.prepend(minorGrid);
        minorGridIcon.style.opacity = 1;
    }
    minorGridOn = !minorGridOn;
    openActionMsg(`Minor Grid: ${minorGridOn?'ON':'OFF'}`);
});

majorGridIcon.addEventListener('click', () => {
    svg = document.getElementById('svg');
    if (majorGridOn) {
        majorGrid.remove();
        majorGridIcon.style.opacity = 0.5;
    } else {
        svg.prepend(majorGrid);
        majorGridIcon.style.opacity = 1;
    }
    majorGridOn = !majorGridOn;
    openActionMsg(`Major Grid: ${majorGridOn?'ON':'OFF'}`);
});

resetSvg.addEventListener('click', () => {
    console.clear();
    pressEsc();
    var svg = document.getElementById('svg');
    var tempGroup = groupItems(Array.from(svg.childNodes).filter((x) => { return ['majorGrid', 'minorGrid'].indexOf(x.id) == -1 && ['defs', 'style'].indexOf(x.tagName) == -1 }));
    var bBox = tempGroup.getBoundingClientRect();
    var newUnits = bBox.height || bBox.width ? svgUnits * Math.min(workingArea.clientWidth / bBox.width, workingArea.clientHeight / bBox.height) : 2;
    var panX = bBox.width ? bBox.x - (window.innerWidth - bBox.width) / 2 : 0;
    var panY = bBox.height ? bBox.y - (window.innerHeight - bBox.height) / 2 : 0;
    ungroupItems(tempGroup);
    changeSvgUnits(newUnits, panX / newUnits, panY / newUnits);
    resetSvg.click();
});

workingArea.addEventListener('wheel', (event) => {
    var sf = 1 - event.deltaY / 10000;
    var bBox = svg.getBoundingClientRect();
    var panX = ((event.x - bBox.x) * (1 - 1 / sf)) / svgUnits;
    var panY = ((event.y - bBox.y) * (1 - 1 / sf)) / svgUnits;
    changeSvgUnits(svgUnits * sf, panX, panY);
    if (svgUnits * minorGridSeparation < 10) {
        changeMinorGridSeparation(minorGridSeparation * 10);
        changeMajorGridSeparation(majorGridSeparation * 10);
    } else if (svgUnits * minorGridSeparation > 100) {
        changeMinorGridSeparation(minorGridSeparation / 10);
        changeMajorGridSeparation(majorGridSeparation / 10);
    }
});

const changeSvgUnits = (units, panX = null, panY = null) => {
    if (units > 0.00001 && units < 100000) {
        var svg = document.getElementById('svg');
        var origin = svg.getAttribute('viewBox').split(' ').slice(0, 2).map(parseFloat);
        var x0 = origin[0] + (panX || 0);
        var y0 = origin[1] + (panY || 0);
        svgUnits = units;
        svg.setAttribute('viewBox', `${x0} ${y0} ${workingArea.clientWidth/svgUnits} ${workingArea.clientHeight/svgUnits}`);
        document.getElementById('minorGridLines').setAttribute('stroke-width', 0.75 / svgUnits);
        document.getElementById('majorGridLines').setAttribute('stroke-width', 1.5 / svgUnits);
        minorGrid.setAttribute('x', x0);
        majorGrid.setAttribute('x', x0);
        minorGrid.setAttribute('y', y0);
        majorGrid.setAttribute('y', y0);
    };
};

workingArea.addEventListener('mousemove', displayXY);

workingArea.addEventListener('mousedown', (event) => {
    moveXYBool = true;
    mouseX = event.x;
    mouseY = event.y;
});

workingArea.addEventListener('mousemove', (event) => moveXY(moveXYBool, event));

workingArea.addEventListener('mouseup', () => {
    moveXYBool = false;
})

const pressEsc = () => {
    var evt = new KeyboardEvent('keydown', { 'key': 'Escape' });
    document.dispatchEvent(evt);
};

document.getElementById('select').addEventListener('click', () => { pressEsc(); });

const pushToDefs = (obj) => {
    var objCopy = obj.cloneNode(true);
    var defs = svg.getElementsByTagName('defs')[0];
    defs.append(objCopy);
    obj.remove();
};

const waitForPoint = () => {
    svg.style.cursor = 'crosshair';
    svg.childNodes.forEach((x) => {
        if (['majorGrid', 'minorGrid', 'defs'].indexOf(x.id) == -1) {
            x.style.cursor = 'crosshair';
        }
    });
};

const stopWaitForPoint = () => {
    svg.style.cursor = 'default';
    svg.childNodes.forEach((x) => {
        if (['majorGrid', 'minorGrid', 'defs'].indexOf(x.id) == -1) {
            x.style.cursor = 'pointer';
        }
    });
};

initializeSvg();
var svg = document.getElementById('svg');

minorGridIcon.click();
majorGridIcon.click();

window.onbeforeunload = function() {
    return "";
};