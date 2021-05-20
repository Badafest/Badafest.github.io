var activePathHandle = null;
var activeEditPath = null;
var activeDataIndex = null;
var activeDataLen = null;
var activePathDataAttr = null;
var originalPathData = null;

var handle = document.createElementNS(ns, 'ellipse');
handle.setAttribute('fill', 'white');
handle.setAttribute('stroke-width', 1 / svgUnits);
handle.setAttribute('stroke', 'black');
handle.setAttribute('cx', 0);
handle.setAttribute('cy', 0);
handle.setAttribute('rx', 5 / svgUnits);
handle.setAttribute('id', 'pathHandle');

const drawPtHandle = (point) => {
    var pt = point[0].split(' ');
    var x = parseFloat(pt[0]);
    var y = parseFloat(pt[1]);
    var pHandle = addObject('use', { 'href': '#pathHandle', 'x': x, 'y': y, 'class': 'handle' });
    pHandle.addEventListener('click', () => {
        if (activePathHandle) {
            activePathHandle = null;
            activeDataIndex = null;
            activeDataLen = null;
        } else {
            activePathHandle = pHandle;
            activeDataIndex = point.index;
            activeDataLen = point[0].length;
        };
        originalPathData = activeEditPath.getAttribute(activePathDataAttr);
    });
};

const editPath = (path) => {
    activeEditPath = path;
    removeById('pathHandle');
    Array.from(svg.getElementsByClassName('handle')).forEach((x) => { x.remove(); });
    removeById('pathTangents');

    activePathDataAttr = path.getAttribute('d') ? 'd' : 'points';
    var data = path.getAttribute(activePathDataAttr);
    originalPathData = originalPathData || data;

    if (!/[a-z]/.exec(data)) {
        activeTool = 'editPath';
        openActionMsg(`Active Tool: Edit Path`, null);
        var points = [...data.matchAll(/[\d. ]+/g)];
        // console.log(points);    
        if (activePathDataAttr == 'd' && !data.match('A')) {
            addObject('polyline', {
                'fill': 'none',
                'stroke-width': 1 / svgUnits,
                'stroke': 'rgb(180, 180, 180)',
                'points': data.replaceAll(/[A-Z]/g, ' '),
                'id': 'pathTangents'
            });
        };

        svg.append(handle);
        pushToDefs(handle);

        points.forEach((point) => {
            if (data[point.index - 2] != 'A' && point[0].split(' ').length == 2) {
                drawPtHandle(point);
            };
        });
    };
}

workingArea.addEventListener('mousemove', () => {
    if (activePathHandle) {
        var pt = coordinates.innerText.replace(',', '');
        var d = activeEditPath.getAttribute(activePathDataAttr);
        activeEditPath.setAttribute(activePathDataAttr, d.slice(0, activeDataIndex) + pt + d.slice(activeDataIndex + activeDataLen));
        activeDataLen = pt.length;
        editPath(activeEditPath);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape') {
        if (activeEditPath) {
            activeEditPath.setAttribute(activePathDataAttr, originalPathData);
        };
        originalPathData = null;
        activeEditPath = null;
        activePathHandle = null;
        removeById('pathHandle');
        removeById('pathTangents');
        Array.from(svg.getElementsByClassName('handle')).forEach((x) => { x.remove(); });
    };
});