import * as d3 from "d3";
import scrollama from "scrollama";
import createMap from "./Map";

const scrolly = d3.select("#scrolly");
const graphic = scrolly.select(".scroll__graphic");
const text = scrolly.select(".scroll__text");
const step = scrolly.selectAll(".step");

// initialize the scrollama
let scroller = scrollama();

function handleResize() {
  const stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");

  const figureHeight = window.innerHeight / 2;
  const figureMarginTop = (window.innerHeight - figureHeight) / 2;

  graphic
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  scroller.resize();
}

function handleStepEnter(response) {
  let currentIndex = response.index;

  step.classed("is-active", function (d, i) {
    return i === currentIndex;
  });

  function loadSVG(url) {
    // Nettoyer la zone graphique
    d3.select("#map").remove();
    d3.select("#mon-svg").selectAll("*").remove();

    d3.svg(url).then(function (data) {
      let parser = new DOMParser();
      let svgString = new XMLSerializer().serializeToString(
        data.documentElement
      );
      let svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      let svgNode = svgDoc.getElementsByTagName("svg")[0];
      d3.select("#mon-svg").node().appendChild(svgNode);
    });
  }

  switch (currentIndex) {
    case 0:
      loadSVG("svg/fond.svg");
      break;
    case 1:
      loadSVG("svg/volcan2.svg");
      break;
    case 2:
      loadSVG("svg/volcan3.svg");
      break;
    case 3:
      loadSVG("svg/volcan4.svg");
      break;
    case 4:
      // Nettoyer le SVG
      d3.select("#mon-svg").selectAll("*").remove();

      if (d3.select("#map").empty()) {
        d3.select(".scroll__graphic")
          .append("div")
          .attr("id", "map")
          .style("width", "72%")
          .style("height", (window.innerHeight - 60) + "px") // hauteur en px
          .style("position", "fixed")
          .style("top", "60px")
          .style("right", "0");

        // Laisser le DOM se mettre à jour avant d'initialiser Leaflet
        setTimeout(() => {
          createMap();
        }, 50);
      }
      break;
  }
}

function handleStepExit(response) {
  let currentIndex = response.index;
  let currentDirection = response.direction;
}

function init() {
  handleResize();

  scroller
    .setup({
      container: "#scrolly",
      graphic: ".scroll__graphic",
      text: ".scroll__text",
      step: ".scroll__text .step",
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  window.addEventListener("resize", handleResize);
}

init();
