var activePathHandle = null;
var activeEditPath = null;
var activeDataIndex = null;
var activeDataLen = null;
var activePathDataAttr = null;
var originalPathData = null;
var activePathTransform = null;

var pathEditorHandle = document.createElementNS(ns, 'ellipse');
pathEditorHandle.setAttribute('fill', 'white');
pathEditorHandle.setAttribute('stroke-width', 1 / svgUnits);
pathEditorHandle.setAttribute('stroke', 'black');
pathEditorHandle.setAttribute('cx', 0);
pathEditorHandle.setAttribute('cy', 0);
pathEditorHandle.setAttribute('rx', 5 / svgUnits);
pathEditorHandle.setAttribute('id', 'pathHandle');

const drawPtHandle = (point) => {
    var pt = point[0].split(' ');
    var pHandle = addObject('use', { 'href': '#pathHandle', 'x': pt[0], 'y': pt[1], 'class': 'handle' });
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
    activePathTransform = path.getAttribute('transform') || activePathTransform;
    activeEditPath.removeAttribute('transform');
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

        if (!data.match('A')) {
            addObject('polyline', {
                'points': data.replaceAll(/[A-Z]/g, ''),
                'stroke': 'rgb(190, 190, 190)',
                'stroke-width': 1 / svgUnits,
                'fill': 'none',
                'id': 'pathTangents'
            });
        };

        svg.append(pathEditorHandle);
        pushToDefs(pathEditorHandle);

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
            activeEditPath.setAttribute('transform', activePathTransform || '');
        };
        originalPathData = null;
        activeEditPath = null;
        activePathHandle = null;
        removeById('pathHandle');
        removeById('pathTangents');
        Array.from(svg.getElementsByClassName('handle')).forEach((x) => { x.remove(); });
    };
});