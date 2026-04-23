import { json } from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import proj4 from "proj4";

window.L = L;
window.proj4 = proj4;

const createMap = () => {
  if (!document.getElementById("side-by-side-script")) {
    const script = document.createElement("script");
    script.id = "side-by-side-script";
    script.src = "/leaflet-side-by-side.js";
    script.onload = initMap;
    document.body.appendChild(script);
  } else {
    initMap();
  }

 json("data/donneesgeographiques.geojson").then((data) => {
      let map = L.map("map").setView([40.82145693478615, 14.425858810559106], 12);

      map.createPane("left");
      map.getPane("left").style.zIndex = 250; 
      
      map.createPane("right");
      map.getPane("right").style.zIndex = 250;

      let basemap = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          pane: "left",
        }
      ).addTo(map);

      const url_to_geotiff_file = "data/raster/carte_historique.tiff";
      fetch(url_to_geotiff_file)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          parseGeoraster(arrayBuffer).then((georaster) => {
            let vectorLayer = L.geoJson(data, {
              style: style,
              onEachFeature: onEachFeature,
            })
              .addTo(map)
              .bringToFront();

            let historicMap = new GeoRasterLayer({
              georaster: georaster,
              opacity: 0.7,
              resolution: 200,
              pane: "right",
            }).addTo(map);

            if (L.control.sideBySide) {
              L.control.sideBySide([basemap], [historicMap]).addTo(map);
              
              // CORRECTION 2 : Bloquer la carte quand on touche au slider
              setTimeout(() => {
                const slider = document.querySelector('.leaflet-sbs-range');
                if (slider) {
                  // Empêche le clic de passer à travers
                  L.DomEvent.disableClickPropagation(slider);
                  
                  // Coupe le déplacement de la carte quand on clique
                  slider.addEventListener('mousedown', () => map.dragging.disable());
                  document.addEventListener('mouseup', () => map.dragging.enable());
                  
                  // Même chose pour les écrans tactiles (smartphones)
                  slider.addEventListener('touchstart', () => map.dragging.disable(), {passive: true});
                  document.addEventListener('touchend', () => map.dragging.enable());
                }
              }, 200);
            }

            fixerZoom(map, 12.5);
            map.invalidateSize();

          });
        });

      function fixerZoom(map, level) {
        map.setMinZoom(level);
        map.setMaxZoom(level);
        map.setZoom(level);
      }

      function getColor(d) {
        const colors = {
          1: "#d12d38", 2: "#1f78b4", 3: "#0002ff", 4: "#ff7f00",
          5: "#e4d97a", 6: "#ffffff", 7: "#ff4fa1", 8: "#9c264f",
          9: "#fb99a4", 10: "#d8a66a", 11: "#ad4832", 12: "#88a758",
          13: "#57360f", 14: "#977f62", 15: "#b65e00", 16: "#ef9c83",
          17: "#91e9f7", 18: "#430109", 19: "#261838"
        };
        return colors[d] || "#ffffff";
      }

      function style(feature) {
        return {
          fillColor: getColor(feature.properties.id),
          fillOpacity: 0.4,
          stroke: false,
        };
      }

      let info = L.control();
      info.onAdd = function (map) {
        this._div = L.DomUtil.create("div", "info");
        this.update();
        return this._div;
      };
      info.update = function () {
        this._div.innerHTML = "<h4>Survolez une coulée pour voir l'année</h4>";
      };
      info.addTo(map);

      function highlightFeature(e) {
        const layer = e.target;
        const color = layer._path.getAttribute("fill");
        const tabPaths = document.querySelectorAll(".leaflet-interactive");
        tabPaths.forEach((el) => {
          if (el.getAttribute("fill") === color) {
            el.style.fillOpacity = 1;
            el.style.stroke = "white";
            el.style.opacity = 1;
          }
        });
        layer.bringToFront();
        layer.bindPopup(layer.feature.properties.annee.toString()).openPopup();
      }

      function resetHighlight(e) {
        const color = e.target._path.getAttribute("fill");
        const tabPaths = document.querySelectorAll(".leaflet-interactive");
        tabPaths.forEach((el) => {
          if (el.getAttribute("fill") === color) {
            el.style.fillOpacity = 0.4;
            el.style.stroke = "";
          }
        });
        e.target.closePopup();
      }

      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
        });
      }
    });
  }
};

export default createMap;
