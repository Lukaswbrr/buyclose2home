import * as pm from "../module/product_manager.js";

let json_dict = {};

const add_product_main = document.getElementById("add-product-main");
const add_product_variation = document.getElementById("add-product-variation");
const save_json_file = document.getElementById("save-json-file");
const load_json_file = document.getElementById("load_json_file");
const load_json_url = document.getElementById("load-json-url");
const json_dict_text = document.getElementById("json-dict-text");
const print_location = document.getElementById("print-location");
const current_location = document.getElementById("location-result");
const clear_json = document.getElementById("clear-json-data");
const json_file = document.getElementById("json-file");


add_product_main.addEventListener("click", _on_click_add_product_main);
add_product_variation.addEventListener("click", _on_click_add_product_variation);
save_json_file.addEventListener("click", saveJSONFile.bind(null, ["saved_json.json"]));
print_location.addEventListener("click", _on_click_print_location);
clear_json.addEventListener("click", _on_click_clear_json_data);
json_file.addEventListener("change", handleFileSelection);
load_json_url.addEventListener("click", _on_load_json_url);

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
        json_dict_text.textContent = reader.result;
    }
    reader.onerror = () => {
        showToast("Error reading the file. Please try again.", "error");
    };

    reader.readAsText(file);

}

function _on_load_json_url() {
    let url = _prompt_text("Type the URL (must be a URL that gets a json file)", "user cancelled URL");
    
    if (url == null || url == "") {
        console.log("URL is empty!");
        return;
    }

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.text();
        })
        .then((text) => {
            json_dict = JSON.parse(text);
            _update_text();
        })
        .catch((error) => {
            console.log(error);
        })
}

function _on_click_clear_json_data() {
    let confirm = _prompt_text("Are you sure? (type clear to confirm)", "user cancelled")
    if (confirm != "clear") {
        return;
    }
    clearJsonData();
    _update_text();
}
//use_current_loc.addEventListener("click", _on_use_current_loc_click);

function clearJsonData() {
    json_dict = {};
}

function loadJSONFile() {
    json_dict = {};
}

function loadJSONurl(url_name) {
    json_dict = {};
}

function _on_click_print_location() {
    getCurrentLocation();
}

function _on_click_add_product_variation() {
    let key_name = _prompt_text("Type the product main key name", "user cancelled");
    if (key_name == null || key_name == "") {
        console.log("nuh uh.");
        return;
    }

    if (key_name in json_dict === false) {
        console.log("It doesn't exist in the JSON!");
        return;
    }

    let product_name = _prompt_text("Type the product variation name", "user cancelled");
    if (product_name == null || product_name == "") {
        return;
    }

    let product_alias = _prompt_text_array("Type the alias of the product variation", "user cancelled");
    if (product_alias == null || product_alias == "") {
        return;
    }

    let storeName = _prompt_text("Type the product variation type name", "user cancelled");
    if (storeName == null || storeName == "") {
        return;
    }

    let priceValue = _prompt_float("Type the product variation type aliases", "user cancelled");
    if (priceValue == null || priceValue == "") {
        return;
    }

    let descriptionValue = _prompt_text("Type the description (can be empty)");
    let imageURL = _prompt_text("Type the image URL (can be empty and later edited)");
    let locationCoordinates = _prompt_float_array("Type the location coordinates (can be empty and use current location later)");

    let new_dict = {
        productName: product_name,
        productAlias: product_alias,
        store: storeName,
        price: priceValue,
        location: locationCoordinates,
        description: descriptionValue,
        image: imageURL
    };

    pm.addProductVariation(key_name, new_dict, json_dict);
    _update_text();
}

function saveJSONFile(filename) {
    const jsonString = JSON.stringify(json_dict, null, 2);

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

function _on_click_add_product_main() {
    let key_name = _prompt_text("Type the product main key name", "user cancelled");
    if (key_name == null || key_name == "") {
        return;
    }

    let product_name = _prompt_text("Type the product main name", "user cancelled");
    if (product_name == null || product_name == "") {
        return;
    }

    let product_main_alias = _prompt_text_array("Type the alias of the main product", "user cancelled");
    if (product_main_alias == null || product_main_alias == "") {
        return;
    }

    let product_main_type = _prompt_text("Type the product main type name", "user cancelled");
    if (product_main_type == null || product_main_type == "") {
        return;
    }

    let product_main_type_alias = _prompt_text_array("Type the product main type aliases", "user cancelled");
    if (product_main_type_alias == null || product_main_type_alias == "") {
        return;
    }

    let new_dict = {
        defaultName: product_name,
        alias: product_main_alias,
        type: product_main_type,
        typeAlias: product_main_type_alias
    };

    pm.addProductDefault(key_name, new_dict, json_dict);
    _update_text();
}

function _update_text() {
    if (Object.keys(json_dict).length === 0) {
        json_dict_text.textContent = "{EMPTY}";
        return;
    }
    json_dict_text.textContent = JSON.stringify(json_dict, null, 2);
}

function _prompt_text(prompt_name, cancel_name) {
    let key = prompt(prompt_name, "");

    if (key == null || key == "") {
        console.log(cancel_name);
        return;
    }

    return key;
}

function _prompt_text_array(prompt_name, cancel_name) {
    let key = prompt(prompt_name, "");

    if (key == null || key == "") {
        console.log(cancel_name);
        return;
    }

    let split = key.split(",");
    let result = [];
    split.forEach((element) => {
        result.push(element.trim());
    });

    return result;
}

function _prompt_int(prompt_int, cancel_name) {
    let number = prompt_int;

    if (number == null || number == "") {
        console.log(cancel_name);
        return;
    }

    return parseInt(number);
}

function _prompt_int_array(prompt_int, cancel_name) {
    let number = prompt_int;

    if (number == null || number == "") {
        console.log(cancel_name);
        return;
    }

    let split = key.split(",");
    let result = [];
    split.forEach((element) => {
        element = parseInt(element);
        result.push(element);
    });

    return parseInt(number);
}

function _prompt_float(prompt_float, cancel_name) {
    let number = prompt_float;

    if (number == null || number == "") {
        console.log(cancel_name);
        return;
    }

    return parseInt(number);
}

function _prompt_float_array(prompt_float, cancel_name) {
    let number = prompt_float;

    if (number == null || number == "") {
        console.log(cancel_name);
        return;
    }

    let split = key.split(",");
    let result = [];
    split.forEach((element) => {
        element = parseInt(element);
        result.push(element);
    });

    return parseInt(number);
}

function getCurrentLocation() {
    if (!"geolocation" in navigator) {
        console.log("Geolocation is not supported by this browser.");
        return;
    }
    let pos = [];
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success callback
            console.log("Latitude:", position.coords.latitude);
            console.log("Longitude:", position.coords.longitude);
            pos.push(position.coords.latitude);
            pos.push(position.coords.longitude);

            current_location.textContent = pos.toString();
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

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
  
  // Usage: