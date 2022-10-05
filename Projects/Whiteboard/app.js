(() => {
  const latex = document.querySelector("#latex");
  const output = document.querySelector("#whiteboard");
  const collapse = document.querySelector("#collapse");
  const color = document.querySelector("#color");

  latex.addEventListener("input", () => {
    let latexString = `\\begin\{align*\}&${latex.value.replaceAll(
      "\n",
      "\\\\&"
    )}\\end\{align*\}`;
    let texOutput = MathJax.tex2svg(latexString);
    if (texOutput.outerHTML.match("merror")) {
      console.log("Oops! Waiting for you to correct some error(s)...");
    } else {
      try {
        output.children[0] && output.children[0].remove();
        output.append(texOutput);
        document.querySelector(".MathJax") &&
          (document.querySelector(".MathJax").style.color = color.value);
      } catch (err) {
        console.log(err);
      }
    }
  });

  collapse.addEventListener("click", () => {
    latex.classList.toggle("hidden");
    if (collapse.innerText == "«") {
      collapse.innerHTML = "»";
    } else {
      collapse.innerHTML = "«";
    }
  });
})();
