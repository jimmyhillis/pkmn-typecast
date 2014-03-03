#!/usr/bin/env node

var pokemon = require('../data/pokemon.json')
  , types = require('../data/types.json')
  , pokemon_types = require('../data/pokemon-types.json')
  , weakness = require('../data/weakness.json')
  , _ = require('underscore');

function type_id_to_name(id) {
    for (type in types) {
        if (types[type].id === id) {
            return types[type].identifier;
        }
    }
    return 'unknown';
}

// add weakness reporting to each type
typesplus = types.map(function (type) {
    // What types damage this type most?
    type.weaknesses = weakness
        .filter(function (item) {
            return (item.target_type_id === type.id &&
                        item.damage_factor === 200);
        })
        .map(function (item) {
            return {
                id: item.damage_type_id,
                identifier: type_id_to_name(item.damage_type_id),
                damage: item.damage_factor
            }
        });
    // What types is this type good against?
    type.strengths = weakness
        .filter(function (item) {
            return (item.target_type_id === type.id &&
                        item.damage_factor === 50);
        })
        .map(function (item) {
            return {
                id: item.damage_type_id,
                identifier: type_id_to_name(item.damage_type_id),
                damage: item.damage_factor
            }
        });
    // what am i immune to?
    type.immunities = weakness
        .filter(function (item) {
            return (item.target_type_id === type.id &&
                        item.damage_factor === 0);
        })
        .map(function (item) {
            return {
                id: item.damage_type_id,
                identifier: type_id_to_name(item.damage_type_id),
                damage: item.damage_factor
            }
        });
    return type;
});

// add type information to each PKMN
pmwt = pokemon
    .map(function (pm) {
        // find all types for each pokemon
        pm.types = pokemon_types
            .filter(function (type) {
                return type.pokemon_id === pm.id
            })
            .map(function (type) {
                for (_type in typesplus) {
                    if (typesplus[_type].id === type.type_id) {
                        return typesplus[_type];
                    }
                }
            });
        return pm;
    })
    .map(function (pm) {
        var strengths = []
          , weaknesses = []
          , immunities = [];
        pm.types.forEach(function (type) {
            strengths = _.uniq(_.union(strengths, type.strengths), false, function (item, key, a) { return item.id; });
            weaknesses = _.uniq(_.union(weaknesses, type.weaknesses), false, function (item, key, a) { return item.id; });
            immunities = _.uniq(_.union(immunities, type.immunities), false, function (item, key, a) { return item.id; });
        });
        // Remove strenghts with dual weakness
        pm.strengths = strengths.filter(function (str_type) {
            for (x in weaknesses) {
                if (str_type.id === weaknesses[x].id) {
                    return false;
                }
            }
            return true;
        });
        pm.weaknesses = weaknesses.filter(function (wkn_type) {
            for (x in strengths) {
                if (wkn_type.id === strengths[x].id) {
                    return false;
                }
            }
            for (x in immunities) {
                if (wkn_type.id === immunities[x].id) {
                    return false;
                }
            }
            return true;
        });
        return pm;
    });


// apply pokemon strengths/weakness when there are multiple types
console.log(JSON.stringify(pmwt));
