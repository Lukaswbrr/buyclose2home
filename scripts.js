import { findStuff, findStuff_variant } from "./module/finder_script.js";
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
const save_as_json_button = document.getElementById("save-as-json");
const unload_json = document.getElementById("unload-json");
const load_json_file = document.getElementById("load-json-file");
const price_minimum_element = document.getElementById("price-minimum")
const price_maximum_element = document.getElementById("price-maximum")

let price_minimum = 0
let price_maximum = 0
let markers = L.markerClusterGroup();

search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        clearMarkers();

        if (search.value == "") {
            heading.textContent = default_search_text;
            return;
        }

        heading.textContent = default_search_text + search.value;
        loadProductsBySearch_variant(search.value);
    }
});

price_maximum_element.addEventListener("input", (event) => {
    
    price_maximum = price_maximum_element.value;

    if (!search.value == "") {
        clearMarkers();
        loadProductsBySearch_variant(search.value)
    }
    
})

price_minimum_element.addEventListener("input", (event) => {
    
    price_minimum = price_minimum_element.value;

    if (!search.value == "") {
        clearMarkers();
        loadProductsBySearch_variant(search.value)
    }
    
})

json_url.addEventListener("change", (event) => {
    
    clearMarkers();

    if (json_url.value == "") {
        products = {};
        return;
    }

    let testthing = {}; 
    pm.loadJsonUrl(json_url.value, testthing)
    .then((json) => {
        products = json;
    })
    .catch((error) => {
        console.log(error);
    });;
    
});

current_location.addEventListener("click", setToCurrentLocation);
save_as_json_button.addEventListener("click", saveDatabaseAsJSON.bind(null, "database_json"));
unload_json.addEventListener("click", unloadData);
load_json_file.addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
    const file = event.target.files[0];

    if (!file) {
        showToast("No file selected. Please choose a file.", "error");
        return;
    }

    if (file.type == "text/json") {
        showToast('Load JSON File error: Not a valid JSON file.', 'failed');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        products = JSON.parse(reader.result);
    };
    reader.onerror = () => {
        showToast("Error reading the file. Please try again.", "error");
    };

    reader.readAsText(file);

}

function unloadData() {
    console.log("cleared data!")
    clearMarkers();
    products = {};
}

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

function loadProductsBySearch_variant(name_of_product, filterPrice = true) {
    let found = findStuff_variant(products, name_of_product);
    let found_array = Array.from(found)
    let result

    if ( ( price_minimum == 0 && price_maximum == 0) ) {
        result = found_array
    } else if ( price_maximum == 0 ) {
        result = found_array.filter((product) => product.price >= price_minimum )
    } else if ( price_minimum == 0 ) {
        result = found_array.filter((product) => product.price <= price_maximum )
    } else {
        result = found_array.filter((product) => product.price >= price_minimum && product.price <= price_maximum )
    }
    
    if (filterPrice) {
        for (let k of result) {
            loadProductsByVariant(k);
        }
        return
    }

    for (let k of found) {
        loadProductsByVariant(k);
    }
}

function loadProductsByKey(name_of_product) {
    let variants = products[name_of_product].variants;

    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];
        createProductMarker(variant.location, variant);
    }
}

function loadProductsByVariant(variant) {
    createProductMarker(variant.location, variant);
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
    const jsonString = JSON.stringify(products, null, 2);

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
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success callback
            console.log("Latitude:", position.coords.latitude);
            console.log("Longitude:", position.coords.longitude);
            map.setView([position.coords.latitude, position.coords.longitude], 15);
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
