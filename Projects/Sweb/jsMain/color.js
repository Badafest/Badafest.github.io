const getHexColor = (str) => {
    if (str.match(/rgb/)) {
        var colArr = str.replaceAll(/[^\d.\,]/g, '').split(',').map(parseFloat);
        var red = (Math.round(colArr[0])).toString(16);
        var green = (Math.round(colArr[1])).toString(16);
        var blue = (Math.round(colArr[2])).toString(16);
        return `#${red.length>1?red:'0'+red}${green.length>1?green:'0'+green}${blue.length>1?blue:'0'+blue}`
    } else {
        var x = document.createElement('div');
        x.style.background = str;
        document.body.append(x);
        var col = getHexColor(window.getComputedStyle(x)['background-color']);
        x.remove();
        return col;
    }
}

const COLORS = [
    'Pink',
    'LightPink',
    'HotPink',
    'DeepPink',
    'PaleVioletRed',
    'MediumVioletRed',
    'Lavender',
    'Thistle',
    'Plum',
    'Orchid',
    'Violet',
    'Magenta',
    'MediumOrchid',
    'DarkOrchid',
    'DarkViolet',
    'BlueViolet',
    'DarkMagenta',
    'Purple',
    'MediumPurple',
    'MediumSlateBlue',
    'SlateBlue',
    'DarkSlateBlue',
    'RebeccaPurple',
    'Indigo',
    'LightSalmon',
    'Salmon',
    'DarkSalmon',
    'LightCoral',
    'IndianRed',
    'Crimson',
    'Red',
    'FireBrick',
    'DarkRed',
    'Orange',
    'DarkOrange',
    'Coral',
    'Tomato',
    'OrangeRed',
    'Gold',
    'Yellow',
    'LightYellow',
    'LemonChiffon',
    'LightGoldenRodYellow',
    'PapayaWhip',
    'Moccasin',
    'PeachPuff',
    'PaleGoldenRod',
    'Khaki',
    'DarkKhaki',
    'GreenYellow',
    'Chartreuse',
    'LawnGreen',
    'Lime',
    'LimeGreen',
    'PaleGreen',
    'LightGreen',
    'MediumSpringGreen',
    'SpringGreen',
    'MediumSeaGreen',
    'SeaGreen',
    'ForestGreen',
    'Green',
    'DarkGreen',
    'YellowGreen',
    'OliveDrab',
    'DarkOliveGreen',
    'MediumAquaMarine',
    'DarkSeaGreen',
    'LightSeaGreen',
    'DarkCyan',
    'Teal',
    'Aqua',
    'Cyan',
    'LightCyan',
    'PaleTurquoise',
    'Aquamarine',
    'Turquoise',
    'MediumTurquoise',
    'DarkTurquoise',
    'CadetBlue',
    'SteelBlue',
    'LightSteelBlue',
    'LightBlue',
    'PowderBlue',
    'LightSkyBlue',
    'SkyBlue',
    'CornflowerBlue',
    'DeepSkyBlue',
    'DodgerBlue',
    'RoyalBlue',
    'Blue',
    'MediumBlue',
    'DarkBlue',
    'Navy',
    'MidnightBlue',
    'Cornsilk',
    'BlanchedAlmond',
    'Bisque',
    'NavajoWhite',
    'Wheat',
    'BurlyWood',
    'Tan',
    'RosyBrown',
    'SandyBrown',
    'GoldenRod',
    'DarkGoldenRod',
    'Peru',
    'Chocolate',
    'Olive',
    'SaddleBrown',
    'Sienna',
    'Brown',
    'Maroon',
    'White',
    'Snow',
    'HoneyDew',
    'MintCream',
    'Azure',
    'AliceBlue',
    'GhostWhite',
    'WhiteSmoke',
    'SeaShell',
    'Beige',
    'OldLace',
    'FloralWhite',
    'Ivory',
    'AntiqueWhite',
    'Linen',
    'LavenderBlush',
    'MistyRose',
    'Gainsboro',
    'LightGray',
    'Silver',
    'DarkGray',
    'DimGray',
    'Gray',
    'LightSlateGray',
    'SlateGray',
    'DarkSlateGray',
    'Black'
]

var gcStart = 53;
(() => {
    var pallete = document.getElementById('pallete');
    for (var x = 0; x < window.innerHeight / 24; x++) {
        var div = document.createElement('div');
        div.style.width = '24px';
        div.style.height = '24px';
        div.style.cursor = 'pointer';
        pallete.append(div);
        div.addEventListener('click', (evt) => {
            removeById('colDiv');
            var temp = document.createElement('div');
            temp.innerText = evt.target.style.backgroundColor;
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
                    evt.target.style.backgroundColor = temp.innerText;
                };
            });
            temp.id = 'colDiv';

            if (evt.shiftKey) {
                changeStrokeColor(getHexColor(evt.target.style.backgroundColor));
            } else {
                changeFillColor(getHexColor(evt.target.style.backgroundColor));
            }
        });
    };
})();

const fillGlobalPallete = () => {
    gcStart = Math.max(0, Math.min(gcStart, COLORS.length - window.innerHeight / 24));
    var colArr = COLORS.slice(gcStart, gcStart + window.innerHeight / 24);
    var divs = document.getElementById('pallete').childNodes;
    for (var x = 1; x < window.innerHeight / 24 + 1; x++) {
        divs[x].style.backgroundColor = colArr[x - 1];
    };
};

document.getElementById('pallete').addEventListener('wheel', (evt) => {
    gcStart += evt.deltaY > 0 ? 5 : -5;
    fillGlobalPallete();
});

fillGlobalPallete();