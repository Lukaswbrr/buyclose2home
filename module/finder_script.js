export function findStuff(obj, term) {
  let keysFound = findAllKeys(obj, term);
  let aliasFound = findAlias(obj, term);
  let variantsNamesFound = findVariantsName(obj, term);
  let variantsAliasFound = findVariantsAlias(obj, term);
  let all = [];

  _addValues(keysFound, all);
  _addValues(aliasFound, all);
  _addValues(variantsNamesFound, all);
  _addValues(variantsAliasFound, all);


  let final_results = new Set(all);

  return final_results;
}

export function findStuff_variant(obj, term) {
  let variantsNamesFound = findVariantsName_exp(obj, term);
  let variantsAliasFound = findVariantsAlias_exp(obj, term);
  let all = [];
  
  _addValues(variantsNamesFound, all);
  _addValues(variantsAliasFound, all);

  let final_results = new Set(all);

  return final_results;
}


export function findAllKeys(obj, searchTerm) {
  return Object.keys(obj).filter(key =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function nameInString(string, name) {
  return string.toLowerCase().includes(name.toLowerCase());
}

function findAlias(obj, term) {
  let found = [];

  for (let k in obj) {
    for (let m in obj[k].alias) {
      if (found.includes(k)) {
        continue;
      }

      if (obj[k].alias[m].includes(term)) {
        found.push(k);
      }
    }
  }
  return found;
}

function findVariantsAlias(obj, term) {
  let found = [];

  for (let k in obj) {
    for (let m in obj[k].variants) {
      let variant = obj[k].variants[m];
      
      for (let p of variant.productAlias) {
        if (found.includes(k)) {
          continue;
        }
        
        if (p.includes(term)) {
          found.push(k);
        }

      }

      
    }
  }
  return found;
}

function findVariantsName(obj, term) {
  let found = [];

  for (let k in obj) {
    for (let m in obj[k].variants) {
      let variant = obj[k].variants[m];

      if (found.includes(k)) {
        continue;
      }
      if (variant.productName.includes(term)) {
        found.push(k);
      }
    }
  }

  return found;
}

function findVariantsName_exp(obj, term) {
  let found = [];

  for (let k in obj) {
    for (let m in obj[k].variants) {
      let variant = obj[k].variants[m];

      if (found.includes(variant)) {
        continue;
      }

      if (nameInString(variant.productName, term)) {
        found.push(variant);
      }
    }
  }

  return found;
}

function findVariantsAlias_exp(obj, term) {
  let found = [];

  for (let k in obj) {
    for (let m in obj[k].variants) {
      let variant = obj[k].variants[m];
      
      for (let p of variant.productAlias) {
        if (found.includes(variant)) {
          continue;
        }
        
        if (nameInString(p, term)) {
          found.push(variant);
        }

      }

      
    }
  }
  return found;
}

function _addValues(array, to_array) {
  let new_array = to_array;

  for (let k in array) {
    new_array.push(array[k]);
  }

  return new_array;
}
