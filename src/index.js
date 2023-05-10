//import { createMap } from "../src/Map.js";
import * as d3 from "d3";
import scrollama from "scrollama";
import createMap from "./Map";
import { circle } from "leaflet";
//import { ScrollamaInstance } from "scrollama";

const scrolly = d3.select("#scrolly");
const graphic = scrolly.select(".scroll__graphic");
// const volcan = scrolly.select(".volcan");
const text = scrolly.select(".scroll__text");
const step = scrolly.selectAll(".step");
const box = d3.selectAll(".box");

// initialize the scrollama
let scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");

  const figureHeight = window.innerHeight / 2;
  const figureMarginTop = (window.innerHeight - figureHeight) / 2;

  graphic
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

function handleStepEnter(response) {
  let currentIndex = response.index;
  step.classed("is-active", function (d, i) {
    return i === currentIndex;
  });

  // Remove existing SVG element
  d3.selectAll("#mon-svg").select("svg").remove();

  function loadSVG(url) {
    d3.select("#map").remove();
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
  const fond = loadSVG("svg/fond.svg");

  //essai de créer la légende avec un path et un cercle sur le svg
  // let groupe = d3.select("#mon-svg").append("g");
  // let circle = groupe
  //   .append("circle")
  //   .attr("cx", 300)
  //   .attr("cy", 700)
  //   .attr("r", 10)
  //   .on("click", function () {})
  //   .bringToFront();

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
      d3.selectAll("#mon-svg").selectChildren().remove();
      if (d3.select("#map").empty()) {
        d3.select(".scroll__graphic").append("div").attr("id", "map");
        createMap();
      }
      break;
  }

  //update graphic based on step here
  let stepData = step.attr("data-step");
}

function handleStepExit(response) {
  // response = { element, direction, index }
  let currentIndex = response.index;
  let currentDirection = response.direction;
}

function init() {
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      container: "#scrolly", // our outermost scrollytelling element
      graphic: ".scroll__graphic", // the graphic
      text: ".scroll__text", // the step container
      step: ".scroll__text .step", // the step elements
      offset: 0.5,
      debug: false, // this being true is what makes the lines show up
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

// kick things off
init();
