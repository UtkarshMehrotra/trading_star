require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "dojo/text!https://developers.arcgis.com/javascript/latest/sample-code/satellites-3d/live/brightest.txt"
], function (Map, SceneView, GraphicsLayer, Graphic, data) {
  var map = new Map({
    basemap: "satellite"
  });

  var view = new SceneView({
    container: "first",
    map: map,
    constraints: {
      altitude: {
        max: 12000000000
      }
    },

    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false
      }
    }
  });

  view.popup.watch("selectedFeature", function () {
    satelliteTracks.removeAll();
  });

  view.popup.on("trigger-action", function (event) {
    if (event.action.id === "track") {
      var graphic = view.popup.selectedFeature;
      var trackFeatures = [];

      for (var i = 0; i < 60 * 24; i++) {
        var loc = null;
        try {
          loc = getSatelliteLocation(
            new Date(graphic.attributes.time + i * 1000 * 60),
            graphic.attributes.line1,
            graphic.attributes.line2
          );
        } catch (error) { }

        if (loc !== null) {
          trackFeatures.push([loc.x, loc.y, loc.z]);
        }
      }

      var track = new Graphic({
        geometry: {
          type: "polyline",
          paths: [trackFeatures]
        },
        symbol: {
          type: "line-3d",
          symbolLayers: [
            {
              type: "line",
              material: {
                color: [192, 192, 192, 0.5]
              },
              size: 3
            }
          ]
        }
      });

      satelliteTracks.add(track);
    }
  });

  var satelliteLayer = new GraphicsLayer();
  var satelliteTracks = new GraphicsLayer();

  map.addMany([satelliteLayer, satelliteTracks]);


  var lines = data.split("\n");
  var count = (lines.length / 3).toFixed(0);

  for (var i = 0; i < count; i++) {
    var commonName = lines[i * 3 + 0];
    var line1 = lines[i * 3 + 1];
    var line2 = lines[i * 3 + 2];
    var time = Date.now();

    var designator = line1.substring(9, 16);
    var launchYear = designator.substring(0, 2);
    launchYear =
      Number(launchYear) >= 57 ? "19" + launchYear : "20" + launchYear;
    var launchNum = Number(designator.substring(2, 5)).toString();
    var noradId = Number(line1.substring(3, 7));
    var satelliteLoc = null;

    try {
      satelliteLoc = getSatelliteLocation(new Date(time), line1, line2);
    } catch (error) { }

    if (satelliteLoc !== null) {
      var template = {

        title: "{name}",
        content: "Launch number {number} of {year}",
        actions: [
          {

            title: "Show Satellite Track",
            id: "track",
            className: "esri-icon-globe"
          }
        ]
      };

      var graphic = new Graphic({
        geometry: satelliteLoc,
        symbol: {
          type: "picture-marker",
          url:
            "https://developers.arcgis.com/javascript/latest/sample-code/satellites-3d/live/satellite.png",
          width: 48,
          height: 48
        },
        attributes: {
          name: commonName,
          year: launchYear,
          id: noradId,
          number: launchNum,
          time: time,
          line1: line1,
          line2: line2
        },
        popupTemplate: template
      });

      satelliteLayer.add(graphic);
    }
  }

  function getSatelliteLocation(date, line1, line2) {
    var satrec = satellite.twoline2satrec(line1, line2);
    var position_and_velocity = satellite.propagate(
      satrec,
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
    var position_eci = position_and_velocity.position;

    var gmst = satellite.gstime_from_date(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );

    var position_gd = satellite.eci_to_geodetic(position_eci, gmst);

    var longitude = position_gd.longitude;
    var latitude = position_gd.latitude;
    var height = position_gd.height;
    if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
      return null;
    }
    var rad2deg = 180 / Math.PI;
    while (longitude < -Math.PI) {
      longitude += 2 * Math.PI;
    }
    while (longitude > Math.PI) {
      longitude -= 2 * Math.PI;
    }
    return {
      type: "point", // Autocasts as new Point()
      x: rad2deg * longitude,
      y: rad2deg * latitude,
      z: height * 1000
    };
  }
});
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('second'), {
    zoom: 7,
    center: { lat: 41.85, lng: -87.65 }
  });
  directionsDisplay.setMap(map);

  var onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  };
  document.getElementById('start').addEventListener('change', onChangeHandler);
  document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING'
  }, function (response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}; 

