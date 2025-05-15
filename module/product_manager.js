export function addProductDefault(name, dict, productDict) {
    productDict[name] = dict;
    productDict[name].variants = [];
}

export function addProductVariation(name, dict, productDict) {
    productDict[name].variants.push(dict);
}

export function loadJsonUrl(url, productDict) {
    return fetch(url)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
    })
}

function setProductLocation(name, location) {
    return;
}

function _getProductsVariantByKey(name, productDict) {
    let key = productDict[name];
    let productsFound = [];

    for (let i = 0; i < key.variants.length; i++) {
        console.log(key.variants[i]);
        productsFound.push(key.variants[i]);
    }
    return productsFound;
}