var fillColor = [255, 255, 255, 1];
var strokeColor = [0, 0, 0, 1];
var strokeWidth = 0.5;
var NO_OF_GCS = 32;

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

})

// var toolBar = document.getElementById('toolBar');
var workingArea = document.getElementById('workingArea');
var globalPallete = document.getElementById('globalPallete');

var fillColorIcon = document.getElementById('fillColorIcon');
var strokeColorIcon = document.getElementById('strokeColorIcon');
var strokeWidthIcon = document.getElementById('strokeWidthIcon');
var strokeWidthValue = document.getElementById('strokeWidth');

var pallete = document.getElementById('colorPallete');
var redValue = document.getElementById('red');
var blueValue = document.getElementById('blue');
var greenValue = document.getElementById('green');
var alphaValue = document.getElementById('alpha');
var rgbValue = document.getElementById('rgbValue');

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

const fillGlobalPallete = (color = null, position = null) => {
    if (color == null) {
        // global pallete
        for (x = 0; x < NO_OF_GCS; x++) {
            var div = document.createElement('div');
            div.style.width = '100%';
            div.style.height = `${100/NO_OF_GCS}%`;
            div.style.cursor = 'pointer';
            if (x == 0) {
                div.style.borderTopRightRadius = '8px';
            } else if (x == NO_OF_GCS - 1) {
                div.style.borderBottomRightRadius = '8px';
            };
            div.id = `gc${x+1}`;
            div.style.top = `${(100/NO_OF_GCS)*x}%`;
            globalPallete.append(div);
            div.addEventListener('click', (evt) => {
                removeById('colDiv');
                var temp = document.createElement('div');
                temp.innerText = evt.target.style.background;
                // console.log(temp.value);
                document.body.append(temp);
                var range = document.createRange();
                range.selectNode(temp);
                window.getSelection().removeAllRanges(); // clear current selection
                window.getSelection().addRange(range); // to select text
                document.execCommand("copy");
                window.getSelection().removeAllRanges(); // to deselect
                temp.setAttribute('contenteditable', 'true');
                temp.style = 'position:absolute; height:16px; width:125px; border:1px solid rgb(220,220,220); border-radius:8px; background:white; font-size:12px; outline:none';
                temp.style.top = `${evt.y}px`;
                temp.style.left = `${evt.x+12}px`;
                temp.oninput = (() => {
                    if (temp.innerText.length > 0) {
                        evt.target.style.background = temp.innerText;
                    };
                });
                temp.id = 'colDiv';
            });
        };
        var reds, blues, greens;
        reds = blues = greens = Math.floor(NO_OF_GCS / 4);
        for (x = 1; x <= reds; x++) {
            var mainValue = 100 + (155 * ((x - 1) / (reds - 1)));
            var otherValue = Math.round((255 - mainValue) / 2);
            document.getElementById(`gc${x}`).style.background = getColor([mainValue, otherValue, otherValue, 1]);
        };
        for (x = 1; x <= greens; x++) {
            var mainValue = 100 + (155 * ((x - 1) / (greens - 1)));
            var otherValue = Math.round((255 - mainValue) / 2);
            document.getElementById(`gc${x+reds}`).style.background = getColor([otherValue, mainValue, otherValue, 1]);
        };
        for (x = 1; x <= blues; x++) {
            var mainValue = 100 + (155 * ((x - 1) / (blues - 1)));
            var otherValue = Math.round((255 - mainValue) / 2);
            document.getElementById(`gc${x+reds+greens}`).style.background = getColor([otherValue, otherValue, mainValue, 1]);
        };
        for (x = 1; x <= NO_OF_GCS - 3 * reds; x++) {
            var mainValue = 100 + (155 * ((x - 1) / (blues - 1)));
            document.getElementById(`gc${x+reds+greens+blues}`).style.background = getColor([mainValue, mainValue, mainValue, 1]);
        };
        document.getElementById(`gc${NO_OF_GCS}`).style.background = 'rgba(0,0,0,0)';
    } else {
        document.getElementById(`gc${position}`).style.background = color;
    }
};

const getColor = (fillColor) => `rgba(${fillColor[0]},${fillColor[1]},${fillColor[2]},${fillColor[3]})`;

const changeFillColor = (newColor) => {
    fillColor = newColor;
    fillColorIcon.style.backgroundColor = getColor(fillColor);
    openActionMsg(`Fill Color: ${newColor}`);
}

const changeStrokeColor = (newColor) => {
    strokeColor = newColor;
    strokeColorIcon.style.backgroundColor = getColor(strokeColor);
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
        svg.setAttribute('viewBox', `${x0} ${y0} ${viewBox[2]} ${viewBox[3]}`);
        minorGrid.setAttribute('x', x0);
        majorGrid.setAttribute('x', x0);
        minorGrid.setAttribute('y', y0);
        majorGrid.setAttribute('y', y0);
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
};

const changeMinorGridSeparation = (separation) => {
    minorGridSeparation = separation;
    minorGridPattern.setAttribute('width', separation);
    minorGridPattern.setAttribute('height', separation);
    minorGridLines.setAttribute('points', `${separation} 0, 0 0, 0 ${separation}`);
    changeSvgUnits(20 / separation);
};

const changeMajorGridSeparation = (separation) => {
    majorGridSeparation = separation;
    majorGridPattern.setAttribute('width', separation);
    majorGridPattern.setAttribute('height', separation);
    majorGridLines.setAttribute('points', `${separation} 0, 0 0, 0 ${separation}`);
    changeSvgUnits(200 / separation);
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

fillColorIcon.addEventListener('click', (event) => {
    pallete.style.left = `calc(${event.x}px - 5%)`;
    pallete.style.display = 'block';
    redValue.value = fillColor[0];
    greenValue.value = fillColor[1];
    blueValue.value = fillColor[2];
    alphaValue.value = fillColor[3];
    rgbValue.innerHTML = `rgba(${fillColor})`;

    var sliders = [redValue, greenValue, blueValue, alphaValue];

    [0, 1, 2, 3].forEach((x) => {
        sliders[x].oninput = () => {
            fillColor[x] = sliders[x].value;
            rgbValue.innerHTML = `rgba(${fillColor})`;
            changeFillColor(fillColor);
        }
    });

    rgbValue.oninput = () => {
        var color = rgbValue.innerText.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i);
        for (x = 0; x < 4; x++) {
            if (color[x + 1] != undefined) {
                sliders[x].value = parseFloat(color[x + 1]);
                fillColor[x] = parseFloat(color[x + 1]);
                changeFillColor(fillColor);
            };
        };
    };
});

strokeColorIcon.addEventListener('click', (event) => {
    pallete.style.left = `calc(${event.x}px - 5%)`;
    pallete.style.display = 'block';
    redValue.value = strokeColor[0];
    greenValue.value = strokeColor[1];
    blueValue.value = strokeColor[2];
    alphaValue.value = strokeColor[3];
    rgbValue.innerHTML = `rgba(${strokeColor})`;

    var sliders = [redValue, greenValue, blueValue, alphaValue];
    [0, 1, 2, 3].forEach((x) => {
        sliders[x].oninput = () => {
            strokeColor[x] = sliders[x].value;
            rgbValue.innerHTML = `rgba(${strokeColor})`;
            changeStrokeColor(strokeColor);
        }
    });

    rgbValue.oninput = () => {
        var color = rgbValue.innerText.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i);
        for (x = 0; x < 4; x++) {
            if (color[x + 1] != undefined) {
                sliders[x].value = parseFloat(color[x + 1]);
                strokeColor[x] = parseFloat(color[x + 1]);
                changeStrokeColor(strokeColor);
            };
        };
    };
});

workingArea.addEventListener('click', (event) => {
    pallete.style.display = 'none';
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
    svg = document.getElementById('svg');
    svgUnits = 2;
    svg.setAttribute('viewBox', `0 0 ${workingArea.clientWidth/svgUnits} ${workingArea.clientHeight/svgUnits}`);
    document.getElementById('minorGridLines').setAttribute('stroke-width', 0.75 / svgUnits);
    document.getElementById('majorGridLines').setAttribute('stroke-width', 1.5 / svgUnits);
    minorGrid.setAttribute('x', 0);
    majorGrid.setAttribute('x', 0);
    minorGrid.setAttribute('y', 0);
    majorGrid.setAttribute('y', 0);
    changeMajorGridSeparation(100);
    changeMinorGridSeparation(10);
    svg.childNodes.forEach((x) => {
        if (['defs', 'style'].indexOf(x.tagName) == -1 && ['majorGrid', 'minorGrid'].indexOf(x.id) == -1) {
            if (x.getBBox().width == 0 && x.getBBox().height == 0) { x.remove(); }
        }
    })
    openActionMsg(`Grids and Zoom Reset`);
});

workingArea.addEventListener('wheel', (event) => {
    changeSvgUnits(svgUnits * (1 + event.deltaY / 1000));
});

const changeSvgUnits = (units) => {
    var svg = document.getElementById('svg');
    svgUnits = Math.max(0.0000001, units);
    var viewBox = svg.getAttribute('viewBox').split(' ');
    svg.setAttribute('viewBox', `${viewBox[0]} ${viewBox[1]} ${workingArea.clientWidth/svgUnits} ${workingArea.clientHeight/svgUnits}`);
    document.getElementById('minorGridLines').setAttribute('stroke-width', 0.75 / svgUnits);
    document.getElementById('majorGridLines').setAttribute('stroke-width', 1.5 / svgUnits);
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

globalPallete.addEventListener('wheel', (evt) => {
    for (x = 0; x < NO_OF_GCS; x++) {
        removeById(`gc${x+1}`);
    }
    NO_OF_GCS += evt.deltaY / 100;
    NO_OF_GCS = NO_OF_GCS < 16 ? 16 : (NO_OF_GCS > 200 ? 200 : NO_OF_GCS);
    fillGlobalPallete();
});

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
fillGlobalPallete();
minorGridIcon.click();
majorGridIcon.click();

window.onbeforeunload = function() {
    return "";
}