import { findStuff } from "./module/finder_script.js";
import * as pm from "./module/product_manager.js";

var map = L.map('map').setView([0, 0], 1);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let products = {};

const heading = document.getElementById("searching-for");
const search = document.getElementById("product-search");
const json_url = document.getElementById("database-json-url");
const current_location = document.getElementById("set-current-location");
const default_search_text = "Searching for: ";
const save_as_json_button = document.getElementById("save-as-json")
const unload_json = document.getElementById("unload-json")

search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        clearMarkers()

        if (search.value == "") {
            heading.textContent = default_search_text;
            return;
        }

        heading.textContent = default_search_text + search.value;
        loadProductsBySearch(search.value);
    }
});

json_url.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        clearMarkers()

        if ( json_url.value == "" ) {
            products = {}
            return
        }

        pm.loadJsonUrl(json_url.value, products)
    }
});

current_location.addEventListener("click", setToCurrentLocation)
save_as_json_button.addEventListener("click", saveDatabaseAsJSON.bind(null, "database_json"))
unload_json.addEventListener("click", unloadData);

function unloadData() {
    clearMarkers();
    products = {};
}

let markers = L.markerClusterGroup();

function setProductLocation(name, location) {
    return;
}

function createProductMarker(location, dict) {
    var mark = L.marker(location);
    markers.addLayer(mark);
    map.addLayer(markers);
    mark.bindPopup("<b>" + dict.productName + "</b><br>" + dict.store + "<br>" + "R$ " + dict.price + "<br><img src=\"" + dict.image + "\" width=100><br>" + dict.description);
}

function _add_marker_object(name, object) {
    products[name].marker_object = object;
}

function loadProducts() {
    var keys = Object.keys(products);

    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        var key_product = products[key];
        for (let m = 0; m < key_product.variants.length; m++) {
            var variant = key_product.variants[m];
            createProductMarker(variant.location, variant);
        }
        ;
    }
}

function loadProductsBySearch(name_of_product) {
    let found = findStuff(products, name_of_product);

    for (let k of found) {
        loadProductsByKey(k);
    }
}

function loadProductsByKey(name_of_product) {
    let variants = products[name_of_product].variants;

    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];
        createProductMarker(variant.location, variant);
    }
}

function _getProductsVariantByKey(name) {
    let key = products[name];
    let productsFound = [];

    for (let i = 0; i < key.variants.length; i++) {
        productsFound.push(key.variants[i]);
    }
    return productsFound;
}

function _getProductsKeyByName(name) {
    let keys = findAllKeys(products, name);

    return keys;
}

function clearMarkers() {
    markers.clearLayers();
}

function saveDatabaseAsJSON(filename) {
    const jsonString = JSON.stringify(products, null, 2)

    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.json';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function setToCurrentLocation() {
    if (!"geolocation" in navigator) {
        console.log("Geolocation is not supported by this browser.");
        return
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
        // Success callback
        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
        map.setView([position.coords.latitude, position.coords.longitude], 15)
        },
        (error) => {
        // Error callback
        console.error("Error getting location:", error.message);
        },
        {
            enableHighAccuracy: true
        }
    );
  }
  