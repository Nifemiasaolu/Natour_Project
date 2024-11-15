/* eslint-disable*/
const locations = JSON.parse(document.getElementById("map").dataset.locations);
console.log(locations)

// Initialize platform with your API key
var platform = new H.service.Platform({
  'apikey': "CXf9B4uzp8Nh1pYNlFn4h86i-edIkRLf8Itv39Ha2oQ"
});

// Obtain the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();

// Instantiate the map:
var map = new H.Map(
  document.getElementById('map'),
  defaultLayers.vector.normal.map,
  // defaultLayers.raster.satellite.map,  // Use satellite map layer
  // defaultLayers.raster.hybrid.map, // Uses a hybrid map that combines satellite images with street and places names overhead on top. Available on subscription plan.
  {
    zoom: 10,
    center: { lat: 37.7749, lng: -122.4194 } , //follows the lat/lng location dynamics
    tilt: 45,      // Tilt angle for 3D effect
    heading: 180   // Rotation (heading) angle in degrees
  });

// Enable map event system
var mapEvents = new H.mapevents.MapEvents(map);

// Add interaction to the map
var behavior = new H.mapevents.Behavior(mapEvents);
behavior.disable(H.mapevents.Behavior.WHEELZOOM) // Disable scroll zoom
// behavior.disable(H.mapevents.Behavior.DRAGGING) // Disable Dragging


// Define bounds based on southwest and northeast coordinates
const minLat = 34.0522; // Southwest corner latitude
const minLng = -118.2437; // Southwest corner longitude
const maxLat = 40.7128; // Northeast corner latitude
const maxLng = -74.0060; // Northeast corner longitude


const bounds = new H.geo.Rect()

locations.forEach(loc => {
  // Add marker
  const el = document.createElement("div")
  el.className = "marker"
})








// Add UI controls to the map
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Customized Pointer
var redPinSVG = "data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2236%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%202C7.03%202%203%206.03%203%2011c0%206.6%207.12%2016.39%208.08%2017.69a1%201%200%200%200%201.84%200C13.88%2027.39%2021%2017.6%2021%2011c0-4.97-4.03-9-9-9z%22%20fill%3D%22red%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2211%22%20r%3D%224%22%20fill%3D%22black%22%2F%3E%3C%2Fsvg%3E";

// Use this SVG as a custom icon in your HERE map marker
var redBlackIcon = new H.map.Icon(redPinSVG, { anchor: { x: 19, y: 47 } });

// Create a marker and add it to the map
var marker = new H.map.Marker(
  {lat: 37.7749, lng: -122.4194},
  {icon: redBlackIcon}
);
map.addObject(marker);

console.log("HERE Map loaded successfully!");
