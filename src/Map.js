import { json } from "d3-fetch";
import * as L from "leaflet";
import "./plugins/leaflet-side-by-side-custom.js";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

const createMap = () => {
  json("data/donneesgeographiques.geojson").then((data) => {
    let map = L.map("map").setView([40.82145693478615, 14.425858810559106], 12);

    map.createPane("left");
    map.createPane("right");

    let basemap = L.tileLayer(
      "https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=9a22e6ca54f54449980daee2749bfe1c",
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        apiKey: "9a22e6ca54f54449980daee2749bfe1c",
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

          L.control
            .sideBySide([basemap], [historicMap])
            .addTo(map);

          // fixerZoom déplacé ici, après que tout est chargé
          fixerZoom(map, 12.5);

          // Forcer Leaflet à recalculer la taille du conteneur
          map.invalidateSize();
        });
      });

    function fixerZoom(map, level) {
      map.setMinZoom(level);
      map.setMaxZoom(level);
      map.setZoom(level);
    }

    function getColor(d) {
      return d == 1
        ? "#d12d38"  // 1701
        : d == 2
        ? "#1f78b4"  // 1820
        : d == 3
        ? "#0002ff"  // 1712
        : d == 4
        ? "#ff7f00"  // 1812
        : d == 5
        ? "#e4d97a"  // 1813
        : d == 6
        ? "#ffffff"  // existe pas
        : d == 7
        ? "#ff4fa1"  // 1810
        : d == 8
        ? "#9c264f"  // 1717
        : d == 9
        ? "#fb99a4"  // 1631
        : d == 10
        ? "#d8a66a"  // 1734
        : d == 11
        ? "#ad4832"  // 1822
        : d == 12
        ? "#88a758"  // 1779
        : d == 13
        ? "#57360f"  // 1771
        : d == 14
        ? "#977f62"  // 1694
        : d == 15
        ? "#b65e00"  // 1805
        : d == 16
        ? "#ef9c83"  // 1754
        : d == 17
        ? "#91e9f7"  // 1786
        : d == 18
        ? "#430109"  // 1806
        : d == 19
        ? "#261838"  // s.d.
        : "#ffffff";
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
      this.update(map);
      return this._div;
    };

    info.update = function (props) {
      this._div.innerHTML =
        "<h4>Survolez une coulée pour faire apparaître l'année de l'éruption</h4>";
    };

    info.addTo(map);

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

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.on("mousemove", function (e) {
          layer.bindPopup(layer.feature.properties.annee).openPopup();
        });
      }
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
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
      });
    }
  });
};

export default createMap;
