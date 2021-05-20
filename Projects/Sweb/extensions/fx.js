// Extension Example//

//STEP 1: DESIGN AND ADD ICON IN EXTENSION MENU
(() => {
    var FxIcon = document.createElement('div');
    //Set class ='exIcon' [defualt icon size + fade effect on click and pointer cursor on hover]
    FxIcon.setAttribute('class', 'exIcon');
    //Id is not used by other scripts. This is for your own convenience. [optional]
    FxIcon.setAttribute('id', 'FxIcon');
    //Icon may be any thing compatible with image. We use svg as used in all other icons.
    //Use ns const as namespace to create svg elements
    var svgIconFx = document.createElementNS(ns, 'svg');
    //svg attributes are set as per of all other icons
    svgIconFx.setAttribute('width', '100%');
    svgIconFx.setAttribute('height', '100%');
    svgIconFx.setAttribute('viewBox', '0 0 1 1');
    var svgIconContent = document.createElementNS(ns, 'path');
    svgIconContent.setAttribute('d', 'M 0.2 0.2 C 0.5 -0.2 0.5 1.2 0.8 0.8');
    //stroke color of all other icons is rgb(90,90,90) and stroke width is almost always 0.05
    svgIconContent.setAttribute('fill', 'none');
    svgIconContent.setAttribute('stroke', 'rgb(90,90,90');
    svgIconContent.setAttribute('stroke-width', '0.05');
    //Append icon content to icon
    svgIconFx.append(svgIconContent);
    FxIcon.append(svgIconFx);
    //You may add your icon anywhere on the extension menu. Here we simply add it to last.
    document.getElementById('extensionMenu').append(FxIcon);
    //Use addToolTip to add tooltip
    addToolTip(FxIcon, 'Plot function', 'left');
    //onclick
    FxIcon.addEventListener('click', () => {
        //activeTool variable should be changed to prevent other tools from being active.
        activeTool = 'fx';
        //display message saying active tool has changed
        openActionMsg('Active Tool: Function Plot', null);
        origin = ax = null;
        removeById('fxInput');
        //waitForPoint() changes cursor temporarily to 'crosshair' [reverted to 'default' on pressing ESC]
        waitForPoint();
    });
})();

//STEP 2: THE CORE EXTENSION PART
const funcs = Object.getOwnPropertyNames(Math);
const atanQ = Math.atan2;
const expM = Math.expm1;
const logTwo = Math.log2;
const logTen = Math.log10;
const logP = Math.log1p;
const DG = Math.PI / 180;

const getFunction = (ox, oy, sx, sy, eqn) => {
    var texStr = eqn.replaceAll('X', `((x-${ox})/${sx})`);
    texStr = texStr.replaceAll('{', '(');
    texStr = texStr.replaceAll('}', ')');
    for (x of funcs) {
        texStr = texStr.replaceAll(x, `Math.${x}`);
    };
    texStr = texStr.replaceAll(/Math\.Math\.aMath\.Math\.(cosh|sinh|tanh)/g, 'Math.a$1');
    texStr = texStr.replaceAll(/Math\.Math\.(cosh|sinh|tanh)/g, 'Math.$1');
    texStr = texStr.replaceAll(/Math\.aMath\.(cos|sin|tan)/g, 'Math.a$1');
    texStr = texStr.replaceAll('Math.Math.atan2', 'atanQ');
    texStr = texStr.replaceAll('Math.Math.expm1', 'expM');
    texStr = texStr.replaceAll('Math.Math.log2', 'logTwo');
    texStr = texStr.replaceAll('Math.Math.log10', 'logTen');
    texStr = texStr.replaceAll('Math.Math.log1p', 'logP');
    texStr = texStr.replaceAll(/(\w)X/g, '$1*x');
    texStr = texStr.replaceAll(/X(\d)/g, 'x**$1');
    texStr = texStr.replaceAll('^', '**');
    texStr = texStr.replaceAll(/X([a-z?A-Z])/g, 'x*$1');
    texStr = texStr.replaceAll(/\)([a-z?A-Z?\(])/g, ')*$1');
    texStr = texStr.replaceAll(/\)(\d)/g, ')**$1');
    texStr = texStr.replaceAll(/(\d)([a-z?A-Z?\(])/g, '$1*$2');
    return Function('x', `return(${oy}-${sy}*(${texStr}))`);
};

const toLatex = (str) => {
    var texStr = str.replaceAll('*', '\\cdot');
    texStr = texStr.replaceAll(/X(\d)/g, 'x^$1');
    texStr = texStr.replaceAll(/\)(\d)/g, ')^$1');
    texStr = texStr.replaceAll('X', 'x');
    texStr = texStr.replaceAll(/abs\(([^\)]+)\)/g, '\\left|$1\\right|');
    texStr = texStr.replaceAll(/sqrt\(([^\)])\)/g, '\\sqrt{$1}');
    texStr = texStr.replaceAll(/cbrt\(([^\)])\)/g, '\\sqrt[3]{$1}');
    texStr = texStr.replaceAll(/exp([^m])/g, '\\exp $1');
    texStr = texStr.replaceAll(/expm1\(([^\)])\)/g, '(\\exp($1)-1)');
    texStr = texStr.replaceAll(/a(cos|sin|tan)h/g, '\\text{a$1h}');
    texStr = texStr.replaceAll(/a(cos|sin|tan)([^h])/g, '\\text{a$1}$2');
    texStr = texStr.replaceAll(/([^a])(cos|sin|tan)([^h])/g, '$1 \\$2 $3');
    texStr = texStr.replaceAll(/(ceil|pow|hypot|floor|max|min|round|trunc|random|sign)/g, '\\text{$1}');
    texStr = texStr.replaceAll(/log([^\d])/g, '\\ln $1');
    texStr = texStr.replaceAll(/log2/g, '\\log_{2}');
    texStr = texStr.replaceAll(/log10/g, '\\log');
    texStr = texStr.replaceAll(/log1p\(([^\)])\)/g, '\\ln(($1)+1)');
    texStr = texStr.replaceAll('E', 'e');
    texStr = texStr.replaceAll('LN10', '\\ln 10');
    texStr = texStr.replaceAll('LN2', '\\ln 2');
    texStr = texStr.replaceAll('LOG10E', '\\log_{10}e');
    texStr = texStr.replaceAll('LOG2E', '\\log_{2}e');
    texStr = texStr.replaceAll('PI', '\\pi');
    texStr = texStr.replaceAll('SQRT1_2', '\\sqrt{1/2}');
    texStr = texStr.replaceAll('SQRT2', '\\sqrt{2}');
    texStr = texStr.replaceAll('(', '\\left( ');
    texStr = texStr.replaceAll(')', '\\right) ');
    texStr = texStr.replaceAll('/', '\\over ');
    return texStr;
};

//drawPath, drawLine, drawTex and groupItems are used from draw.js
//Functions in draw.js actually add objects in the core svg part.
//They are all editable as if drawn using UI.
//object with id=tempObj is destroyed on mousemove or when pressing Esc key

var plotGroup = null;
const plotFunction = (ox, oy, ax, fx, no = 20, x0 = 0, sx = majorGridSeparation, sy = majorGridSeparation, yMin = parseFloat(svg.getAttribute('viewBox').split(' ')[1]), yMax = parseFloat(svg.getAttribute('viewBox').split(' ')[3]) + yMin, tickUnit = 1, tickRatio = majorGridSeparation / minorGridSeparation, temp = false) => {
    x0 = x0 * sx;
    sx = Math.max(1, sx);
    sy = Math.max(1, sy);
    no = Math.max(2, no);
    yMin = Math.min(oy, yMin);
    yMax = Math.max(oy, yMax);

    tickUnit = Math.max(1, tickUnit);
    tickRatio = tickRatio / tickUnit;
    var ayMin = oy;
    var ayMax = oy;

    var t, y = oy;
    var step = (ax - ox) / no;
    var f = getFunction(ox, oy, sx, sy, fx);
    var path;
    for (i = 0; i <= no; i++) {
        t = ox + i * step;
        y = Math.max(yMin, Math.min(f(t + x0) || y, yMax));
        ayMax = Math.max(yMin, Math.min(y, ayMax));
        ayMin = Math.min(yMax, Math.max(y, ayMin));
        if (i == 1) {
            path = drawLine([ox, Math.max(yMin, Math.min(f(ox + x0) || oy, yMax))], [t, y]);
        } else if (i > 1) {
            drawLine([t, y], null, path);
        }
    };

    var pathData = path.getAttribute('points');
    pathData = pathData.replaceAll('-Infinity', ayMax);
    pathData = pathData.replaceAll('Infinity', ayMin);
    path.setAttribute('points', pathData);

    var xAxis = drawLine([ox, oy], [ax, oy]);
    var yAxis = drawLine([ox, ayMin], [ox, ayMax]);

    var sepMul = ax > ox ? 1 : -1;

    var xTickMajId = `xTickMaj${Math.round(Math.random()*1000)}`
    var xTickMaj = addObject('path', { 'd': `M\n${ox} ${oy-minorGridSeparation/6}\nl\n0 ${minorGridSeparation/3}`, 'id': xTickMajId });
    var xTicksMaj = [xTickMaj];
    for (i = 1; i <= Math.floor((ax - ox) / (sx * tickUnit)); i++) {
        xTicksMaj.push(addObject('use', { 'href': `#${xTickMajId}`, 'x': `${i*sx*tickUnit}` }));
    };

    var xTickMinId = xTickMajId.replace('Maj', 'Min');
    var xTickMin = addObject('path', { 'd': `M\n${ox} ${oy-minorGridSeparation/12}\nl\n0 ${minorGridSeparation/6}`, 'id': xTickMinId });
    var xTicksMin = [xTickMin];
    for (i = 1; i <= Math.floor(tickRatio * (ax - ox) / sx); i++) {
        xTicksMin.push(addObject('use', { 'href': `#${xTickMinId}`, 'x': `${i*sx/tickRatio}` }));
    };

    var xTicks = [groupItems(xTicksMin), groupItems(xTicksMaj)];

    var yTickMajId = xTickMajId.replace('x', 'y');
    var yTickMaj = addObject('path', { 'd': `M\n${ox-minorGridSeparation/6} ${oy}\nl\n${minorGridSeparation/3} 0`, 'id': yTickMajId });
    var yTicksMaj = [yTickMaj];
    for (i = 1; i <= Math.floor((ayMin - oy) / (sy * tickUnit)); i++) {
        yTicksMaj.push(addObject('use', { 'href': `#${yTickMajId}`, 'y': `${i*sy*tickUnit}` }));
    };
    for (i = 1; i <= Math.floor((oy - ayMax) / (sy * tickUnit)); i++) {
        yTicksMaj.push(addObject('use', { 'href': `#${yTickMajId}`, 'y': `-${i*sy*tickUnit}` }));
    };

    var yTickMinId = xTickMinId.replace('x', 'y');
    var yTickMin = addObject('path', { 'd': `M\n${ox-minorGridSeparation/12} ${oy}\nl\n${minorGridSeparation/6} 0`, 'id': yTickMinId });
    var yTicksMin = [yTickMin];
    for (i = 1; i <= Math.floor(tickRatio * (ayMin - oy) / sy); i++) {
        yTicksMin.push(addObject('use', { 'href': `#${yTickMinId}`, 'y': `${i*sy/tickRatio}` }));
    };
    for (i = 1; i <= Math.floor(tickRatio * (oy - ayMax) / sy); i++) {
        yTicksMin.push(addObject('use', { 'href': `#${yTickMinId}`, 'y': `-${i*sy/tickRatio}` }));
    };

    var yTicks = [groupItems(yTicksMin), groupItems(yTicksMaj)];

    var xArrMin = addObject('path', { 'd': `M\n${ox} ${oy}\nl\n${-sepMul*minorGridSeparation} 0\n0 -${minorGridSeparation/4}\n${-sepMul*minorGridSeparation/2} ${minorGridSeparation/4}\n${sepMul*minorGridSeparation/2} ${minorGridSeparation/4}\n0 ${-minorGridSeparation/4}` });
    var xArrMax = addObject('path', { 'd': `M\n${ax} ${oy}\nl\n${sepMul*minorGridSeparation} 0\n0 -${minorGridSeparation/4}\n${sepMul*minorGridSeparation/2} ${minorGridSeparation/4}\n${-sepMul*minorGridSeparation/2} ${minorGridSeparation/4}\n0 ${-minorGridSeparation/4}` });
    var yArrMin = addObject('path', { 'd': `M\n${ox} ${ayMin}\nl\n0 ${minorGridSeparation}\n${minorGridSeparation/4} 0\n-${minorGridSeparation/4} ${minorGridSeparation/2}\n-${minorGridSeparation/4} -${minorGridSeparation/2}\n${minorGridSeparation/4} 0` });
    var yArrMax = addObject('path', { 'd': `M\n${ox} ${ayMax}\nl\n0 -${minorGridSeparation}\n${minorGridSeparation/4} 0\n-${minorGridSeparation/4} -${minorGridSeparation/2}\n-${minorGridSeparation/4} ${minorGridSeparation/2}\n${minorGridSeparation/4} 0` });

    var texSvg = MathJax.tex2svg(toLatex('y={' + fx + '}')).childNodes[0];
    texSvg.setAttribute('color', getStrokeColor());
    var fReader = new FileReader();
    fReader.readAsDataURL(new Blob([new XMLSerializer().serializeToString(texSvg)], { type: "image/svg+xml;charset=utf-8" }));
    fReader.onloadend = (event) => {
        removeById('tempObj');
        texItem = drawImage([(ox + ax) / 2, ayMax], [(ox + ax) / 2 + parseFloat(texSvg.getAttribute('width')) * 12,
                ayMax + parseFloat(texSvg.getAttribute('height')) * 10
            ],
            event.target.result);
        texItem.setAttribute('x', `${parseFloat(texItem.getAttribute('x'))-parseFloat(texItem.getAttribute('width'))/2}`);
        texItem.setAttribute('y', `${parseFloat(texItem.getAttribute('y'))-1.5*parseFloat(texItem.getAttribute('height'))}`);
        texItem.setAttribute('transform', `scale(0.5)`);

        [xArrMax, xArrMin, yArrMax, yArrMin].forEach((x) => {
            x.setAttribute('fill', 'none');
        });

        var items = [groupItems([groupItems(xTicks), xArrMax, xArrMin, xAxis]),
            groupItems([groupItems(yTicks), yArrMax, yArrMin, yAxis]),
            path, texItem
        ];

        items.forEach((x) => {
            x.setAttribute('fill', 'none');
        });

        plotGroup = groupItems(items);
        if (temp) { plotGroup.setAttribute('id', 'tempObj') };
    };
};

//STEP 3: CODE TO ACCEPT INPUT FROM USER AND PERFORM TASK
//Event Listener is used in icon just defined.
var origin = null;
var ax = null;

//coordinates variable gives current coordinates as displayed in bottom right corner of working area.
workingArea.addEventListener('click', () => {
    //it is important to check if the activeTool is 'fx' or not
    if (activeTool == 'fx') {
        //coordinates.innerText gives "x, y"
        var point = coordinates.innerText.split(', ');
        if (origin == null) {
            origin = [parseFloat(point[0]), parseFloat(point[1])];
        } else {
            ax = parseFloat(point[0]);
            //For other inputs we use openDialogBox() defined below
            removeById('fxInput');
            openDialogBox();
            //stop to wait for point as it is no longer needed
            stopWaitForPoint();
        };
    };
});

//drawing a temporary horizontal line while choosing second point helps user choose it efficiently
workingArea.addEventListener('mousemove', () => {
    if (activeTool == 'fx' && origin != null && ax == null) {
        var point = coordinates.innerText.split(', ');
        var xAxisTemp = drawLine(origin, [point[0], origin[1]]);
        xAxisTemp.setAttribute('id', 'tempObj');
    }
});

const openDialogBox = () => {
    var inputDialog = document.createElement('div');
    inputDialog.setAttribute('id', 'fxInput');
    inputDialog.style.position = 'absolute';
    inputDialog.style.width = '20%';
    // inputDialog.style.height = '';
    inputDialog.style.background = 'white';
    inputDialog.style.border = '1px solid rgb(110,110,110)'
    inputDialog.style.borderRadius = '5px';
    inputDialog.style.right = '4%';
    inputDialog.style.top = '5%';
    inputDialog.style.fontSize = '14px';

    var functionInput = document.createElement('input');
    functionInput.style.width = '80%';
    functionInput.style.marginBottom = '5%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '8%';
    label.innerText = 'Function:  Y ~ f(X)';
    inputDialog.append(label);
    inputDialog.append(functionInput);
    inputDialog.append(document.createElement('hr'));

    var xAxisInput = document.createElement('input');
    xAxisInput.setAttribute('type', 'number');
    xAxisInput.setAttribute('step', '1');
    xAxisInput.setAttribute('value', '0');
    xAxisInput.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'X<sub>0</sub>';
    inputDialog.append(label);
    inputDialog.append(xAxisInput);
    inputDialog.append(document.createElement('hr'));

    var scaleX = document.createElement('input');
    scaleX.setAttribute('type', 'number');
    scaleX.setAttribute('step', '1');
    scaleX.setAttribute('value', majorGridSeparation);
    scaleX.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'X-axis scale';
    inputDialog.append(label);
    inputDialog.append(scaleX);
    inputDialog.append(document.createElement('hr'));

    var scaleY = document.createElement('input');
    scaleY.setAttribute('type', 'number');
    scaleY.setAttribute('step', '1');
    scaleY.setAttribute('value', majorGridSeparation);
    scaleY.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'Y-axis scale';
    inputDialog.append(label);
    inputDialog.append(scaleY);
    inputDialog.append(document.createElement('hr'));

    var tickUnitIn = document.createElement('input');
    tickUnitIn.setAttribute('type', 'number');
    tickUnitIn.setAttribute('step', '1');
    tickUnitIn.setAttribute('value', '1');
    tickUnitIn.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'Major Tick Unit';
    inputDialog.append(label);
    inputDialog.append(tickUnitIn);
    inputDialog.append(document.createElement('hr'));

    var tickRatioIn = document.createElement('input');
    tickRatioIn.setAttribute('type', 'number');
    tickRatioIn.setAttribute('step', '1');
    tickRatioIn.setAttribute('value', majorGridSeparation / minorGridSeparation);
    tickRatioIn.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'Minor Ticks : Major Ticks';
    inputDialog.append(label);
    inputDialog.append(tickRatioIn);
    inputDialog.append(document.createElement('hr'));

    var yMinIn = document.createElement('input');
    yMinIn.setAttribute('type', 'number');
    yMinIn.setAttribute('step', minorGridSeparation);
    yMinIn.setAttribute('value', parseFloat(svg.getAttribute('viewBox').split(' ')[1]));
    yMinIn.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'Minimum Y-value';
    inputDialog.append(label);
    inputDialog.append(yMinIn);
    inputDialog.append(document.createElement('hr'));

    var yMaxIn = document.createElement('input');
    yMaxIn.setAttribute('type', 'number');
    yMaxIn.setAttribute('step', minorGridSeparation);
    yMaxIn.setAttribute('value', parseFloat(svg.getAttribute('viewBox').split(' ')[1]) + parseFloat(svg.getAttribute('viewBox').split(' ')[3]));
    yMaxIn.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerHTML = 'Maximum Y-value';
    inputDialog.append(label);
    inputDialog.append(yMaxIn);
    inputDialog.append(document.createElement('hr'));

    var numberOfPts = document.createElement('input');
    numberOfPts.setAttribute('type', 'number');
    numberOfPts.setAttribute('min', '2');
    numberOfPts.setAttribute('max', '500');
    numberOfPts.setAttribute('step', '1');
    numberOfPts.setAttribute('value', '100');
    numberOfPts.style.width = '50%';
    var label = document.createElement('p');
    label.style.margin = '3px';
    label.style.marginTop = '3%';
    label.innerText = 'Number of points';
    inputDialog.append(label);
    inputDialog.append(numberOfPts);
    inputDialog.append(document.createElement('hr'));

    var subBtn = document.createElement('button');
    subBtn.innerText = 'OK';
    subBtn.style.marginLeft = '0%';
    subBtn.style.width = '20%';
    inputDialog.append(subBtn);
    document.body.append(inputDialog);
    //On pressing OK button accept the input and plot graph:
    subBtn.addEventListener('click', () => {
        plotFunction(origin[0], origin[1], ax, functionInput.value, parseInt(numberOfPts.value), parseFloat(xAxisInput.value), parseInt(scaleX.value), parseInt(scaleY.value), parseFloat(yMinIn.value), parseFloat(yMaxIn.value), parseInt(tickUnitIn.value), parseInt(tickRatioIn.value));
    });
    //Give live update on changing input
    const liveUpdate = () => {
        if (functionInput.value.length > 0) {
            plotFunction(origin[0], origin[1], ax, functionInput.value, parseInt(numberOfPts.value), parseFloat(xAxisInput.value), parseInt(scaleX.value), parseInt(scaleY.value), parseFloat(yMinIn.value), parseFloat(yMaxIn.value), parseInt(tickUnitIn.value), parseInt(tickRatioIn.value), true);
        };
    };

    tickUnitIn.oninput = () => { liveUpdate(); };
    tickRatioIn.oninput = () => { liveUpdate(); };
    yMaxIn.oninput = () => { liveUpdate(); };
    yMinIn.oninput = () => { liveUpdate(); };
    scaleY.oninput = () => { liveUpdate(); };
    scaleX.oninput = () => { liveUpdate(); };
    xAxisInput.oninput = () => { liveUpdate(); };
    numberOfPts.oninput = () => { liveUpdate(); };
    functionInput.oninput = () => { liveUpdate(); };
};

//To close the open dialog box on pressing Escape key.
//Active tool is changed to null everytime Escape is pressed.
//removeById() function removes the element if it exists.
document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        removeById('fxInput');
        origin = null;
        ax = null;
    };
});