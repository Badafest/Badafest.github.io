const openMsgBox = (style, content, life = null, id = null) => {
    var msgBox = document.createElement('div');
    msgBox.setAttribute('class', 'msgBox');
    msgBox.innerHTML = `<pre style='margin:0,padding:0'>${content}</pre>`;
    msgBox.style = style;
    msgBox.style.opacity = 0;
    if (id) {
        removeById(id);
        msgBox.id = id;
    }
    document.body.append(msgBox);
    setTimeout(() => { msgBox.style.opacity = 1 }, 10);
    if (life) {
        setTimeout(() => {
            msgBox.style.opacity = 0;
        }, life * 1000);
        setTimeout(() => {
            msgBox.remove();
        }, 1500 + life * 1000);
    } else {
        return msgBox;
    };
};

var showTooltip = true;
const addToolTip = (obj, content, position = 'bottom') => {
    obj.addEventListener('mouseenter', () => {
        if (showTooltip) {
            removeById('toolTip');
            var bBox = obj.getBoundingClientRect();
            var tt = openMsgBox('', content, null, `${obj.id}ToolTip`);
            switch (position) {
                case 'top':
                    tt.style = `left:${bBox.x + bBox.width/2}px;transform:translate(-50%,-100%);top:${bBox.y-6}px`;
                    break;
                case 'bottom':
                    tt.style = `left:${bBox.x + bBox.width/2}px;transform:translate(-50%);top:${bBox.y+bBox.height+6}px`;
                    break;
                case 'left':
                    tt.style = `left:${bBox.x - 6}px;top:${bBox.y+bBox.height/2}px;transform:translate(-100%,-50%)`;
                    break;
                case 'right':
                    tt.style = `left:${bBox.x + bBox.width+6}px;top:${bBox.y+bBox.height/2}px;transform:translate(0,-50%)`;
                    break;
                default:
                    tt.style = `left:${bBox.x + bBox.width/2}px;top:${bBox.y+bBox.height/2}px;transform:translate(-50%,-50%)`;
                    break;
            }
            tt.id = 'toolTip';
            obj.addEventListener('mouseleave', () => {
                setTimeout(() => { tt.style.opacity = 0; }, 100);
                setTimeout(() => { tt.remove(); }, 500);
            });
        };
    });
};

const openActionMsg = (msg, life = 1) => {
    openMsgBox('bottom:12px;left:50%;transform:translate(-50%)', msg, life, 'actMsg');
};

const openProgressMsg = (msg, per = null) => {
    var msgBox = document.createElement('div');
    msgBox.innerText = per ? `${msg}-${per}%` : msg;
    msgBox.style = 'top:58px;right:50%;transform:translate(50%);color:white;position:absolute;width:fit-content;font-size:14px;padding:4px 8px;border-radius:12px;'
    msgBox.style.background = `linear-gradient(90deg,  rgba(0,0,0,1) ${per||100}%, rgba(0,0,0,0.5) ${per||100}%)`;
    document.body.append(msgBox);
    return msgBox;
}

addToolTip(document.getElementById('xyDisplay'), 'Click to change grid separation', 'top');
addToolTip(document.getElementById('globalPallete'), 'Click to copy or edit color', 'right');

addToolTip(document.getElementById('fillColorIcon'), 'Default Fill Color');
addToolTip(document.getElementById('strokeColorIcon'), 'Default Stroke Color');
addToolTip(document.getElementById('gradientIcon'), 'Create and Apply Gradient');
addToolTip(document.getElementById('strokes'), 'Default Stroke Width');
addToolTip(document.getElementById('fonts'), 'Default Font');

addToolTip(document.getElementById('majorGrids'), 'Toggle Major Grid On/Off');
addToolTip(document.getElementById('minorGrids'), 'Toggle Minor Grid On/Off');
addToolTip(document.getElementById('resetSvg'), 'Reset to Default Zoom');

addToolTip(document.getElementById('select'), 'Discard Active Tool');
addToolTip(document.getElementById('group'), 'Group [Select+Enter]<br>Ungroup [Ctrl+Click]<br><a style="color:white"  target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g">Online Help</a>');
addToolTip(document.getElementById('ccp'), 'Box Select');
addToolTip(document.getElementById('edit'), 'Interactive Transform<br>[About Center]<br><a style="color:white"  target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform">Online Help</a>');

addToolTip(document.getElementById('drawLine'), 'Draw Polyline<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline">Online Help</a>');
addToolTip(document.getElementById('drawPath'), 'Draw Beizer Path<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path">Online Help</a>');
addToolTip(document.getElementById('drawArc'), 'Draw Arc<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path">Online Help</a>');
addToolTip(document.getElementById('drawFree'), 'Draw Freehand Path<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path">Online Help</a>');
addToolTip(document.getElementById('drawEllipse'), 'Draw Ellipse<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse">Online Help</a>');
addToolTip(document.getElementById('drawRect'), 'Draw Rounded Rectangle<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect">Online Help</a>');
addToolTip(document.getElementById('drawText'), 'Add Text<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text">Online Help</a>');
addToolTip(document.getElementById('drawTex'), 'Add LaTeX<br>[uses MathJaX]<br><a style="color:white" target="_blank" href="https://www.caam.rice.edu/~heinken/latex/symbols.pdf">Online Help</a>');
addToolTip(document.getElementById('drawImg'), 'Add Image<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image">Online Help</a>');

addToolTip(document.getElementById('addObject'), 'Add Any SVG Object<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element">Online Help</a>');
addToolTip(document.getElementById('attPainter'), 'Paint Attributes<br>[Click on source and then on destinations]<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation">Online Help</a>');

addToolTip(document.getElementById('animateProperty'), 'Add Attribute Animation<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate">Online Help</a>');
addToolTip(document.getElementById('animateTransform'), 'Add Transform Animation<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animatetransform">Online Help</a>');
addToolTip(document.getElementById('animateMotion'), 'Add Motion Animation<br><a style="color:white" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animatemotion">Online Help</a>');
addToolTip(document.getElementById('viewTimeline'), 'Open Timeline<br>[To edit animations, export frames and video]');
addToolTip(document.getElementById('exportVideo'), 'Export Video of All Scenes<br>[May use FFMPEG]');

addToolTip(document.getElementById('openSvg'), 'Open a SVG File');
addToolTip(document.getElementById('saveSvg'), 'Save as SVG File');
addToolTip(document.getElementById('savePng'), 'Download as Image<br>[JPG | PNG]');

addToolTip(document.getElementById('settingsIcon'), 'Settings', 'left');
addToolTip(document.getElementById('modeIcon'), 'Present | Edit', 'left');

addToolTip(document.getElementById('prevScene'), 'Previous Scene', 'top');
addToolTip(document.getElementById('nextScene'), 'Next Scene', 'top');
addToolTip(document.getElementById('sceneList'), 'List All Scenes', 'top');
addToolTip(document.getElementById('addScene'), 'Add a Scene<br>[Ctrl+Click = copy content]<br>[Ctrl+Alt+Click = mask content]', 'top');
addToolTip(document.getElementById('mergeScene'), 'Merge Last Scene to Second Last', 'top');

addToolTip(document.getElementById('presentPrevScene'), 'Previous Scene', 'top');
addToolTip(document.getElementById('presentNextScene'), 'Next Scene', 'top');
addToolTip(document.getElementById('presentPlayPause'), 'Play | Pause', 'top');