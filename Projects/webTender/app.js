const userForm = document.querySelector('#userForm');
const livePreview = document.querySelector('#livePreview');
const liveDocSelect = document.querySelector('#preview');
const firmType = document.querySelector('#firmType');

var getLiveDoc = getLopb;
var firmTypeSingle = false;

document.querySelector('#printBtn').addEventListener('click',()=>{
	let printReady = true;
	Array.from(userForm).forEach((input)=>{
		if(input.required && !input.value.length){
			input.classList.add('required');
			printReady = false;
		}
	});
	if(printReady){
		print();
	}else{
		if(confirm('The form is not completely filled. Are you sure you want to print?')){
			print();
		}
	}
});

liveDocSelect.addEventListener('input',()=>{
	switch(liveDocSelect.value){
		case 'declareDoc':
			getLiveDoc = getDd;
			break;
		case 'letterOfTechBid':
			getLiveDoc = getLotb;
			break;
		case 'powerOfAttorney':
			getLiveDoc = getPoa;
			break;
		case 'letterOfBid':
			getLiveDoc = getLob;
			break;
		default:
			getLiveDoc = getLopb;
	}
	initLiveDoc();
});
firmType.addEventListener('input',()=>{
	firmTypeSingle = firmType[0].checked;
	initLiveDoc();
})

function parseFormToJSON(formElement) {
	return JSON.parse(`\{${Array.from(formElement).map((x)=>{
		return `"${x.name}":"${x.value.replaceAll('\n','*').replaceAll(/[<>]/g,'')}"`;
	}).join(',')}\}`);
}

userForm.addEventListener('input',(evt)=>{
	evt.target.classList.remove('required');
	if(evt.target.value.length==0 && evt.target.required){
		evt.target.classList.add('required');
	}
	initLiveDoc();
});

const addClassList = (obj,list)=>{obj && obj.classList.add(...list);};

applyDefaultStyles = (article)=>{
	addClassList(article.querySelector('#title'),['bold','center','large','one-line-break','underline']);
	addClassList(article.querySelector('#topRightText'),['right','two-line-break']);
	addClassList(article.querySelector('#mainContent'),['two-line-break']);
	addClassList(article.querySelector('#toPart'),['one-line-break']);
	addClassList(article.querySelector('ol'),['larger-margin']);
	addClassList(article.querySelector('#bottomRightText'),['right'])
};

makeSpansEditable=(article)=>{
	article.querySelectorAll('span').forEach((x)=>{
		x.setAttribute('contenteditable','true');
		x.classList.add('bold')
	});
};

(initLiveDoc = ()=>{
	document.title = `Tender | ${userForm[0].value || 'Untitled'}`;
	let htmlString = getLiveDoc(parseFormToJSON(userForm));
	if(firmTypeSingle){htmlString = htmlString.replaceAll('Authorized JV Partner','Proprietor')};
	livePreview.innerHTML = htmlString;
	applyDefaultStyles(livePreview.querySelector('article'));
	makeSpansEditable(livePreview.querySelector('article'));
})();