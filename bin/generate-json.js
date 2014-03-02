#!/usr/bin/env node

var pokemon = require('../data/pokemon.json')
  , types = require('../data/types.json')
  , pokemon_types = require('../data/pokemon-types.json')
  , weakness = require('../data/weakness.json');

function type_id_to_name(id) {
    for (type in types) {
        if (types[type].id == id) {
            return types[type].identifier;
        }
    }
    return 'unknown';
}

// add weakness reporting to each type
typesplus = types.map(function (type) {
    type.weakness = weakness
        .filter(function (item) {
            return (item.damage_type_id == type.id &&
                        item.damage_factor !== 100);
        })
        .map(function (item) {
            return {
                type: type_id_to_name(item.target_type_id),
                damage: item.damage_factor
            }
        });
    return type;
});


// add type information to each pkmn
pmwt = pokemon.map(function (pm) {
    // find all types for each pokemon
    pm.types = pokemon_types
        .filter(function (type) {
            return type.pokemon_id === pm.id
        })
        .map(function (type) {
            for (_type in typesplus) {
                if (typesplus[_type].id == type.type_id) {
                    return typesplus[_type];
                }
            }
        });
    return pm;
});


console.log(JSON.stringify(pmwt));
