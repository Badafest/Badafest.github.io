const drawHollowRoundedRectange = (A, B, C=null,) => {
	x = parseFloat(A[0]);
	y = parseFloat(A[1]);
    w = Math.abs(parseFloat(B[0])-x);
    h = Math.abs(parseFloat(B[1])-y);
	C = C || B;
    t = parseFloat(C[0])-parseFloat(B[0]);
    r = parseFloat(C[1])-parseFloat(B[1]);
    return addObject('path', {
        'd': `M${x-w+r+t} ${y-h}L${x+w-r-t} ${y-h} A${r+t} ${r+t} 0 0 1 ${x+w} ${y-h+r+t} L${x+w} ${y+h-r-t} A${r+t} ${r+t} 0 0 1 ${x+w-r-t} ${y+h} L${x-w+r+t} ${y+h} A${r+t} ${r+t} 0 0 1 ${x-w} ${y+h-r-t} L${x-w} ${y-h+r+t} A${r+t} ${r+t} 0 0 1 ${x-w+r+t} ${y-h} M${x-w+t+r} ${y-h+t} L${x+w-t-r} ${y-h+t} A${r} ${r} 0 0 1 ${x+w-t} ${y-h+t+r} L${x+w-t} ${y+h-t-r} A${r} ${r} 0 0 1 ${x+w-t-r} ${y+h-t} L${x-w+t+r} ${y+h-t} A${r} ${r} 0 0 1 ${x-w+t} ${y+h-t-r} L${x-w+t} ${y-h+t+r} A${r} ${r} 0 0 1 ${x-w+t+r} ${y-h+t}`,
        'fill-rule': 'evenodd'
    });
};

var polygonStarNoOfSides = 5;
const drawPolygonStar = (A, B, C=null, n=polygonStarNoOfSides) => {
	C = C || B;
	var x = parseFloat(A[0]);
	var y = parseFloat(A[1]);
	var radius = Math.hypot(parseFloat(B[0])-x,parseFloat(B[1])-y);
    n = Math.max(n, 3);
    var theta = Math.PI / n;
    var apothem = radius*Math.cos(theta);
    var a = radius*Math.sin(theta);
	var o = parseFloat(C[0])-parseFloat(B[0]);
    apothem += o;
    var pts = [];
    for (let index = 0; index < n; index++) {
        var alpha = 2 * index * theta;
        var beta = 2 * (index + 1) * theta;
        var gamma = 0.5 * (alpha + beta);
        pts.push([`${radius*Math.cos(alpha)+x} ${radius*Math.sin(alpha)+y}`,
            `${apothem*Math.cos(gamma)+x} ${apothem*Math.sin(gamma)+y}`,
            `${radius*Math.cos(beta)+x} ${radius*Math.sin(beta)+y}`
        ])
    };
    return addObject('path', {
        'd': 'M\n' + pts.join('\n').replaceAll(',', ' ')
    })
};

const shapeToolBar = document.createElement('div');
(()=>{
	shapeToolBar.setAttribute('class','shapeToolBar');
	shapeToolBar.style.top = '52px';
	shapeToolBar.id = 'shapeToolbar';
	
	const dummyIcon = document.getElementById('drawRect').cloneNode(true);
	dummyIcon.removeAttribute('id');
	dummyIcon.getElementsByTagName('rect')[0].remove();
	
	const dummyPath = document.createElementNS(ns,'path');
	dummyPath.setAttribute('stroke','rgb(90,90,90)');
	dummyPath.setAttribute('fill','white');
	dummyPath.setAttribute('stroke-width','0.05');
	
	const hrrIcon = dummyIcon.cloneNode(true);
	hrrIcon.id = 'drawHollowRoundedRectange';
	const hrrIconContent = dummyPath.cloneNode();
	hrrIcon.getElementsByTagName('svg')[0].append(hrrIconContent);
	hrrIconContent.setAttribute('d',"M0.3 0.09999999999999998L0.7000000000000001 0.09999999999999998 A0.2 0.2 0 0 1 0.9 0.3 L0.9 0.7000000000000001 A0.2 0.2 0 0 1 0.7000000000000001 0.9 L0.3 0.9 A0.2 0.2 0 0 1 0.09999999999999998 0.7000000000000001 L0.09999999999999998 0.3 A0.2 0.2 0 0 1 0.3 0.09999999999999998 M0.3 0.19999999999999998 L0.7000000000000001 0.19999999999999998 A0.1 0.1 0 0 1 0.8 0.3 L0.8 0.7000000000000001 A0.1 0.1 0 0 1 0.7000000000000001 0.8 L0.3 0.8 A0.1 0.1 0 0 1 0.19999999999999998 0.7000000000000001 L0.19999999999999998 0.3 A0.1 0.1 0 0 1 0.3 0.19999999999999998");
	
	hrrIcon.addEventListener('click',()=>{
		pressEsc();
		lastClickedIcon = hrrIcon;
		clickedCoordinates = [];
		activeTool = 'hrr';
		removeById('tempObj');
		waitForPoint();
		openActionMsg(`Active Tool: Shape - Hollow Rounded Rectangle`, null);
	});
	
	const psIcon = dummyIcon.cloneNode(true);
	psIcon.id = 'drawPolygonStar';
	const psIconContent = dummyPath.cloneNode();
	psIcon.getElementsByTagName('svg')[0].append(psIconContent);
	psIconContent.setAttribute('d',"M 0.71266270208801 0.5 0.8414437941451878 0.7480734373699868 0.5657163890148917 0.7022542485937369 0.5657163890148917 0.7022542485937369 0.3695800758842607 0.901391253370657 0.32795225994110333 0.625 0.32795225994110333 0.625 0.07795225994110327 0.5 0.32795225994110333 0.375 0.32795225994110333 0.375 0.36958007588426056 0.09860874662934316 0.5657163890148916 0.29774575140626314 0.5657163890148916 0.29774575140626314 0.8414437941451877 0.2519265626300132 0.71266270208801 0.49999999999999994");
	
	psIcon.addEventListener('click',(evt)=>{
		pressEsc();
		lastClickedIcon = psIcon;
		clickedCoordinates = [];
		activeTool = 'ps';
		removeById('tempObj');
		removeById('tempInput');
		waitForPoint();
		openActionMsg(`Active Tool: Shape - Polygon | Star`, null);
		var tempInput = document.createElement('input');
		tempInput.setAttribute('type','number');
		tempInput.setAttribute('min',3);
		tempInput.setAttribute('max',20);
		tempInput.setAttribute('step',1);
		tempInput.setAttribute('value',polygonStarNoOfSides);
		tempInput.oninput=()=>{
			polygonStarNoOfSides = tempInput.value;
		};
		tempInput.id = 'tempInput';
		tempInput.style = `position:absolute;left:${evt.x}px;top:${evt.y}px`;
		document.body.append(tempInput);
	});

	shapeToolBar.append(hrrIcon);
	shapeToolBar.append(psIcon);
	addToolTip(hrrIcon,'Draw Hollow Rounded Rectangle');
	addToolTip(psIcon,'Draw Polygon or Star');
})();