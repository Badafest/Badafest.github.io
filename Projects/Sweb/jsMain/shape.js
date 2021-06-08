const hollowRoundedRectangle = (x, y, w, h, t = null, r = null) => {
    w = w / 2;
    h = h / 2;
    t = t || 0;
    r = r || 0;
    return addObject('path', {
        'd': `M${x-w+r+t} ${y-h}L${x+w-r-t} ${y-h} A${r+t} ${r+t} 0 0 1 ${x+w} ${y-h+r+t} L${x+w} ${y+h-r-t} A${r+t} ${r+t} 0 0 1 ${x+w-r-t} ${y+h} L${x-w+r+t} ${y+h} A${r+t} ${r+t} 0 0 1 ${x-w} ${y+h-r-t} L${x-w} ${y-h+r+t} A${r+t} ${r+t} 0 0 1 ${x-w+r+t} ${y-h} M${x-w+t+r} ${y-h+t} L${x+w-t-r} ${y-h+t} A${r} ${r} 0 0 1 ${x+w-t} ${y-h+t+r} L${x+w-t} ${y+h-t-r} A${r} ${r} 0 0 1 ${x+w-t-r} ${y+h-t} L${x-w+t+r} ${y+h-t} A${r} ${r} 0 0 1 ${x-w+t} ${y+h-t-r} L${x-w+t} ${y-h+t+r} A${r} ${r} 0 0 1 ${x-w+t+r} ${y-h+t}`,
        'fill-rule': 'evenodd'
    });
};

const polygonStar = (x, y, a, n, o = 0) => {
    n = Math.max(n, 3);
    var theta = Math.PI / n;
    var apothem = a / (2 * Math.tan(theta));
    var radius = Math.hypot(apothem, a / 2);
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