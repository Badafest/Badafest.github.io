(() => {
  const projects = [
    {
      title: "SWEB",
      tag: "A SVG Editor in Web",
      icon: "/Projects/Sweb/sweb.svg",
      live: "https://badafest.github.io/Projects/Sweb",
      source:
        "https://github.com/Badafest/badafest.github.io/tree/master/Projects/Sweb",
      description:
        "Sweb is an online SVG editor. One can create svg graphics with ease, add animation and even export frames and videos. The svg itself can be downloaded with one loop animation or infinite loop animation. This app is perfect for creating logos, illustrations and even presentations. With the feature of adding extensions, it can be customized and expanded to limits of your imagination.",
      tech: ["HTML", "CSS", "JS", "SVG", "JSZIP", "MATHJAX", "FFMPEG"],
    },
    {
      title: "WebTender",
      tag: "Create Tender Documents",
      icon: "/Projects/webTender/icon.svg",
      live: "https://badafest.github.io/Projects/webTender",
      source:
        "https://github.com/Badafest/badafest.github.io/tree/master/Projects/webTender",
      description:
        "Everytime some contractor prepares tender documents, nothing new is added except a few specific details. These documents can be prepared as templates for quick and easy preparation. This web app does exactly that. Documents are generated with generic templates and few inputs from user. Apart from that, there are editable fields in the documents themselves for further editing. These documents can be printed (saved as PDF) in A4 size paper with appropriate margins.",
      tech: ["HTML", "CSS", "JS"],
    },
    {
      title: "Whiteboard",
      tag: "A Simple LaTeX Frontend",
      icon: "/Projects/Whiteboard/img.svg",
      live: "https://badafest.github.io/Projects/Whiteboard",
      source:
        "https://github.com/Badafest/badafest.github.io/tree/master/Projects/Whiteboard",
      description:
        "In Whiteboard, user can type LaTeX and see it render live. LaTeX is not updated if there is some error in the input. There are also few syntactical sugars added like every piece is automatically made displaystyle. Similarly, newlines are auto rendered. There is no need to type double backslashes. The latex can be rendered in color of choice too.",
      tech: ["HTML", "CSS", "JS", "MATHJAX"],
    },
  ];

  let changeActiveInterval;

  const projectList = document.querySelector(".project-list");
  projects.forEach((project) => {
    const projectListItem = document.createElement("li");
    projectListItem.classList.add("project-list-item");
    projectListItem.style.opacity = 0;

    const projectListItemTitle = document.createElement("h4");
    projectListItemTitle.innerText = project.title;
    projectListItemTitle.classList.add("project-title");

    const projectListItemTag = document.createElement("p");
    projectListItemTag.innerText = project.tag;
    projectListItemTag.classList.add("project-tag");

    const projectListItemIcon = document.createElement("img");
    projectListItemIcon.setAttribute("src", project.icon);
    projectListItemIcon.classList.add("project-icon");

    const projectListItemDescription = document.createElement("p");
    projectListItemDescription.innerText = project.description;
    projectListItemDescription.classList.add("project-description");

    const projectListItemTech = document.createElement("p");
    project.tech.forEach((elem) => {
      const techSpan = document.createElement("span");
      techSpan.innerText = elem;
      techSpan.classList.add("tag");
      projectListItemTech.append(techSpan);
    });
    projectListItemTech.classList.add("project-tech");

    const projectListItemLive = document.createElement("a");
    projectListItemLive.setAttribute("href", project.live);
    projectListItemLive.setAttribute("target", "_blank");
    projectListItemLive.innerText = "LIVE DEMO";
    projectListItemLive.classList.add("project-live");
    projectListItemLive.classList.add("button");

    const projectListItemSource = document.createElement("a");
    projectListItemSource.setAttribute("target", "_blank");
    projectListItemSource.setAttribute("href", project.source);
    projectListItemSource.innerText = "SEE SOURCE";
    projectListItemSource.classList.add("project-source");
    projectListItemSource.classList.add("button");

    projectListItem.append(projectListItemTitle);
    projectListItem.append(projectListItemTag);
    projectListItem.append(projectListItemIcon);
    projectListItem.append(projectListItemDescription);
    projectListItem.append(projectListItemTech);
    projectListItem.append(projectListItemLive);
    projectListItem.append(projectListItemSource);

    projectList.append(projectListItem);
  });

  let active = 0;
  const navDots = document.querySelector(".nav-dots");
  for (let index = 0; index < projects.length; index++) {
    const dot = document.createElement("span");
    dot.setAttribute("index", index);
    dot.innerText = "◯";
    dot.classList.add("nav-dot");
    navDots.append(dot);
    dot.addEventListener("click", () => {
      clearInterval(changeActiveInterval);
      active = parseInt(dot.getAttribute("index"));
      setChangeActiveInterval();
      changeActive();
    });
  }

  const changeActive = () => {
    const prevIndices = [...Array(projects.length).keys()].filter(
      (x) => x != active
    );
    projectList.children[active].style.opacity = 1;
    projectList.children[active].style.zIndex = 999;
    navDots.children[active].innerText = "⬤";
    prevIndices.forEach((prevIndex) => {
      projectList.children[prevIndex].style.opacity = 0;
      projectList.children[prevIndex].style.zIndex = 0;
      navDots.children[prevIndex].innerText = "⭘";
    });
    active = active < projects.length - 1 ? active + 1 : 0;
  };

  const setChangeActiveInterval = () => {
    changeActiveInterval = setInterval(() => {
      changeActive();
    }, 8000);
  };

  changeActive();
  setChangeActiveInterval();

  ///disable opacity 0 links
  document.querySelectorAll("a").forEach((elem) => {
    elem.addEventListener("click", (e) => {
      if (elem.parentElement.style.opacity === "0") {
        e.preventDefault();
        elem.classList.remove("button");
        elem.classList.add("button");
      }
    });
  });
})();
