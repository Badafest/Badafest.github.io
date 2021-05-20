var selectedGroup = null;
var selectionBoxCoords = null;
var selBox = null;

const copyObject = (obj, dX = 0, dY = 0) => {
    var tObj = obj.cloneNode(true);
    svg.append(tObj);
    tObj.addEventListener('click', (event) => { editObject(event, tObj) });
    tObj.addEventListener('mouseenter', () => { drawBoundingBox(tObj); });
    tObj.addEventListener('mouseout', () => { removeById('boundingBox'); });
    if (!tObj.getAttribute('transform')) { tObj.setAttribute('transform', 'translate(0,0)') };
    moveObject(tObj, dX, dY);
    return tObj;
};

const duplicateObject = (obj, dX = 0, dY = 0) => {
    if (!obj.id) { obj.id = `duplicateParent${Math.round(Math.random()*1000)}` };
    var href = `#${obj.id}`;
    return addObject('use', { 'href': href, 'x': dX, 'y': dY });
};

const objsBounded = (x, y, w, h) => {
    var objs = Array.from(svg.childNodes);
    return objs.filter((o) => {
        var bb = o.getBoundingClientRect();
        if (bb && bb.width * bb.height > 0) {
            return bb.x > x && bb.y > y && bb.x + bb.width < x + w && bb.y + bb.height < y + h;
        } else {
            return false;
        }
    });
};

var ccpIcon = document.getElementById('ccp');

ccpIcon.addEventListener('click', () => {
    pressEsc();
    activeTool = 'ccp';
    openActionMsg('Active Tool: Box Select', null);
});

workingArea.addEventListener('click', (e) => {
    if (activeTool == 'ccp') {
        if (!selectionBoxCoords && !selBox) {
            selectionBoxCoords = coordinates.innerText.split(', ');
            selBox = document.createElementNS(ns, 'rect');
            selBox.setAttribute('fill', 'rgba(0,0,0,0.05)');
            selBox.setAttribute('stroke', 'black');
            selBox.setAttribute('stroke-width', 1 / svgUnits);
            selBox.setAttribute('stroke-dasharray', `${20/svgUnits} ${10/svgUnits}`);
            svg.append(selBox);
        } else if (selectionBoxCoords) {
            selectionBoxCoords = null;
            selectedGroup = groupItems(objsBounded(selBox.getBoundingClientRect().x, selBox.getBoundingClientRect().y, selBox.getBoundingClientRect().width, selBox.getBoundingClientRect().height));
            if (selectedGroup.childNodes.length > 0) {
                var ccpMenu = document.createElement('div');
                ccpMenu.style = `position:absolute;left:${selBox.getBoundingClientRect().x}px;top:${selBox.getBoundingClientRect().y+selBox.getBoundingClientRect().height}px;border:1px solid rgb(190,190,190);border-radius:8px;background:white;`;
                document.body.append(ccpMenu);
                ccpMenu.id = 'ccpMenu';

                var copyIcon = document.createElement('button');
                copyIcon.innerText = 'Copy';
                copyIcon.style = 'margin: 8px';
                ccpMenu.append(copyIcon);
                copyIcon.addEventListener('click', () => {
                    activeTool = 'copy';
                    openActionMsg('Active Tool: Copy', null);
                });

                var cloneIcon = document.createElement('button');
                cloneIcon.innerText = 'Clone';
                cloneIcon.style = 'margin: 8px';
                ccpMenu.append(cloneIcon);
                cloneIcon.addEventListener('click', () => {
                    activeTool = 'clone';
                    openActionMsg('Active Tool: Clone', null);
                });

                var deleteIcon = document.createElement('button');
                deleteIcon.innerText = 'Delete';
                deleteIcon.style = 'margin: 8px';
                ccpMenu.append(deleteIcon);
                deleteIcon.addEventListener('click', () => {
                    Array.from(selectedGroup.childNodes).forEach((x) => { x.remove(); })
                    pressEsc();
                });

                var groupIcon = document.createElement('button');
                groupIcon.innerText = 'Group';
                groupIcon.style = 'margin: 8px';
                ccpMenu.append(groupIcon);
                groupIcon.addEventListener('click', () => {
                    selectedGroup = groupItems([selectedGroup]);
                    pressEsc();
                });
            };
        } else {
            if (selectedGroup) {
                if (Array.from(selectedGroup.childNodes).indexOf(e.target) != -1) {
                    var elem = e.target;
                    var temp = copyObject(elem, 0, 0);
                    svg.insertBefore(temp, selBox);
                    elem.remove();
                } else {
                    selBox.remove();
                    pressEsc();
                    ccpIcon.click();
                    workingArea.dispatchEvent(new Event('click', e));
                }
            } else {
                selBox.remove();
                pressEsc();
                ccpIcon.click();
                workingArea.dispatchEvent(new Event('click', e));
            }
        };
    } else if (activeTool == 'copy' || activeTool == 'clone') {
        var copyObj = document.getElementById('copyObj');
        copyObj.removeAttribute('id');
        ungroupItems(copyObj);
    };
});

workingArea.addEventListener('mousemove', () => {
    if (activeTool == 'ccp' && selectionBoxCoords) {
        var A = coordinates.innerText.split(', ');
        selBox.setAttribute('x', Math.min(selectionBoxCoords[0], A[0]));
        selBox.setAttribute('y', Math.min(selectionBoxCoords[1], A[1]));
        selBox.setAttribute('width', Math.abs(selectionBoxCoords[0] - A[0]));
        selBox.setAttribute('height', Math.abs(selectionBoxCoords[1] - A[1]));
    } else if (activeTool == 'copy' || activeTool == 'clone') {
        removeById('copyObj');
        var cpF = activeTool == 'copy' ? copyObject : duplicateObject;
        var A = coordinates.innerText.split(', ');
        var clnItms = Array.from(selectedGroup.childNodes).map((x) => {
            return cpF(x, A[0] - selectedGroup.getBoundingClientRect().x / svgUnits, A[1] - selectedGroup.getBoundingClientRect().y / svgUnits);
        });
        var temp = groupItems(clnItms);
        temp.id = 'copyObj';
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape') {
        if (selectedGroup) { ungroupItems(selectedGroup); };
        selectedGroup = null;
        selectionBoxCoords = null;
        if (selBox) { selBox.remove(); };
        selBox = null;
        removeById('ccpMenu');
        removeById('copyObj');
        stopWaitForPoint();
    };
});