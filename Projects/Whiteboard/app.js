const latex = document.querySelector('#latex');
const output = document.querySelector('#whiteboard');
const collapse = document.querySelector('#collapse');

latex.addEventListener('input',()=>{
	let latexString = `\\begin\{align*\}&${latex.value.replaceAll('\n','\\\\&')}\\end\{align*\}`;
	let texOutput = MathJax.tex2svg(latexString);
	if(texOutput.outerHTML.match('merror')){
		console.log('Oops! Waiting for you to correct some error(s)...')
	}else{
		output.children[0] && output.children[0].remove();
		output.append(texOutput);
	}
});

collapse.addEventListener('click',()=>{
	latex.classList.toggle('hidden');
	if(collapse.innerText == '«'){
		collapse.innerHTML = '»'
	}else{
		collapse.innerHTML = '«'
	};
})