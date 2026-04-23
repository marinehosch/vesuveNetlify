import * as d3 from "d3";
import scrollama from "scrollama";
import createMap from "./Map";

const scrolly = d3.select("#scrolly");
const graphic = scrolly.select(".scroll__graphic");
const step = scrolly.selectAll(".step");

let scroller = scrollama();

function handleResize() {
  const stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");
  graphic.style("height", window.innerHeight + "px");
  scroller.resize();
}

function handleStepEnter(response) {
  let currentIndex = response.index;

  step.classed("is-active", (d, i) => i === currentIndex);

  const container = d3.select("#mon-svg");

  // CAS ÉTAPE 5 : LA CARTE
  if (currentIndex === 4) {
    container.selectAll("*").remove(); // On vide les SVGs
    if (d3.select("#map").empty()) {
      d3.select(".scroll__graphic")
        .append("div")
        .attr("id", "map")
        .style("width", "100%")
        .style("height", "100%");
      
      setTimeout(() => { createMap(); }, 50);
    }
    return;
  }

  // CAS ÉTAPES 1 À 4 : LES SVGS CUMULÉS
  d3.select("#map").remove(); // On enlève la carte si on remonte
  container.selectAll("*").remove(); // Reset pour ré-empiler proprement

  const svgsToLoad = [];
  if (currentIndex >= 0) svgsToLoad.push("svg/fond.svg");
  if (currentIndex >= 1) svgsToLoad.push("svg/volcan2.svg");
  if (currentIndex >= 2) svgsToLoad.push("svg/volcan3.svg");
  if (currentIndex >= 3) svgsToLoad.push("svg/volcan4.svg");

  Promise.all(svgsToLoad.map(url => d3.xml(url)))
    .then(results => {
      results.forEach(data => {
        container.node().appendChild(data.documentElement);
      });
    })
    .catch(err => console.error("Erreur superposition SVG:", err));
}

function init() {
  handleResize();
  scroller
    .setup({
      container: "#scrolly",
      graphic: ".scroll__graphic",
      text: ".scroll__text",
      step: ".step",
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener("resize", handleResize);
}

init();
