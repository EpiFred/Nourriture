/**
 * Created by Julian on 09/11/2014.
 */

db = db.getSiblingDB('Nourriture');

// ================================================================== FOOD ==================================================================
db.food.insert({
    'name' : 'Pomme',
    'picture' : 'url to do',
    'nutritional_values': "{}"
});

db.food.insert({
    'name' : 'Poire',
    'picture' : 'url to do',
    'nutritional_values': "{}"
});

db.food.insert({
    'name' : 'Cerise',
    'picture' : 'url to do',
    'nutritional_values': "{}"
});

db.food.insert({
    'name' : 'Abricot',
    'picture' : 'url to do',
    'nutritional_values': "{}"
});
// ================================================================== RECIPES ==================================================================
db.recipes.insert({
    'name' : 'Made in China',
    'description' : 'Totally Made In China',
    'picture' : 'url to do',
    'make_time' : 789451,
    'cooking_time:' : 45671,
    'instruction' : "",
    'food' : [{},{}]
});
// ================================================================== USER ==================================================================
db.user.insert({
    'pseudo' : 'Aziz',
    'password' : 'light',
    'firstname' : 'A',
    'lastname' : 'Ziz',
    'email' : 'b@b.b',
    'avatar' : 'url to do',
    'Restriction' : [],
    'Favorites' : []
});
