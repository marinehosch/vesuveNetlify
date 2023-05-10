import { json } from "d3-fetch";
import * as L from "leaflet";
import "./plugins/leaflet-side-by-side-custom.js";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

const createMap = () => {
  json("data/donneesgeographiques.geojson").then((data) => {
    //afficher la carte :
    let map = L.map("map").setView([40.82145693478615, 14.425858810559106], 12);

    map.createPane("left");
    map.createPane("right");

    //j'ajoute un premier layer (carte actuelle)
    let basemap = L.tileLayer(
      "     https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=9a22e6ca54f54449980daee2749bfe1c",
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        apiKey: "9a22e6ca54f54449980daee2749bfe1c",
      }
    ).addTo(map);

    // geotiff layer
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
            resolution: 200, // optional parameter for adjusting display resolution
            pane: "right",
          }).addTo(map);

          L.control
            .sideBySide([], [basemap, vectorLayer, historicMap])
            .addTo(map);
        });
      });

    //fixer le zoom
    function fixerZoom(map, level) {
      map.setMinZoom(level);
      map.setMaxZoom(level);
      +map.setZoom(level);
    }

    fixerZoom(map, 12.5);

    function getColor(d) {
      return d == 1
        ? "#d12d38" //1701 couleur ok
        : d == 2
        ? "#1f78b4" //1820 couleur ok
        : d == 3
        ? "#0002ff" //1712 couleur ok
        : d == 4
        ? "#ff7f00" //1812 couleur ok
        : d == 5
        ? "#e4d97a" //1813 couleur ok
        : d == 6
        ? "#ffffff" //existe pas...
        : d == 7
        ? "#ff4fa1" //1810 couleur ok
        : d == 8
        ? "#9c264f" //1717 couleur ok
        : d == 9
        ? "#fb99a4" //1631 couleur ok
        : d == 10
        ? "#d8a66a" //1734 couleur ok
        : d == 11
        ? "#ad4832" //1822 couleur ok
        : d == 12
        ? "#88a758" //1779	 couleur ok
        : d == 13
        ? "#57360f" //1771 couleur ok
        : d == 14
        ? "#977f62" //1694 couleur ok
        : d == 15
        ? "#b65e00" //1805 couleur ok
        : d == 16
        ? "#ef9c83" //1754 couleur ok
        : d == 17
        ? "#91e9f7" //1786 couleur ok
        : d == 18
        ? "#430109" //1806 couleur ok
        : d == 19
        ? "#261838" // s.d. couleur ok
        : "#ffffff";
    }

    //afficher le style de base des features
    function style(feature) {
      return {
        fillColor: getColor(feature.properties.id),
        fillOpacity: 0.4,
        stroke: false,
      };
    }

    //ajout de légende
    let info = L.control();
    info.onAdd = function (map) {
      this._div = L.DomUtil.create("div", "info");
      this.update(map);
      return this._div;
    };

    info.update = function (props) {
      this._div.innerHTML =
        "<h4>Survolez une coulée pour faire apparaître l'année de l'éruption</h4>";
    };

    info.addTo(map);

    //fonction lors d'action au hover pour  changement d'opacité (ou de couleur à voir)
    function highlightFeature(e) {
      const layer = e.target;
      const color = layer._path.getAttribute("fill");
      const tabPaths = document.querySelectorAll(".leaflet-interactive");

      tabPaths.forEach((el) => {
        const fill = el.getAttribute("fill");
        if (fill === color) {
          el.style.fillOpacity = 1;
          el.style.stroke = "white";
          el.style.opacity = 1;
          el.style.weight = 2;
          el.parentNode.appendChild(el);
        }
      });

      layer.bringToFront();

      // ajout d'un popup au hover avec l'année de la coulée
      function bindPopup(feature, layer) {
        let popupContent = `${feature.properties.annee}`;

        layer.bindPopup(popupContent);

        layer.on("mouseover", function (e) {
          this.openPopup(e.latlng);
        });
        layer.on("mouseout", function (e) {
          this.closePopup();
        });
      }

      // ajout d'un popup au hover avec l'année de la coulée
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.on("mousemove", function (e) {
          layer.bindPopup(layer.feature.properties.annee).openPopup();
        });
      }
    }

    //fonction pour remettre la couleur d'origine
    function resetHighlight(e) {
      const color = e.target._path.getAttribute("fill");
      const tabPaths = document.querySelectorAll(".leaflet-interactive");
      tabPaths.forEach((el) => {
        if (el.getAttribute("fill") === color) {
          el.style.fillOpacity = 0.4;
          el.style.stroke = "";
        }
      });
    }

    //fonction de listener pour les actions au hover et au mouseout (ou click)
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
      });
    }
  });
};

//export { createMap };
export default createMap;