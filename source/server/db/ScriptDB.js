/**
 * Created by Julian on 09/11/2014.
 */

db = db.getSiblingDB('Nourriture');


// ================================================================== VARIETY ==================================================================
db.variety.insert({
    'Name' : 'Golden',
    'Origin' : 'Afrique',
    'Location' : [],
    'Label' : [],
    'Price' : 0,
    'NutritionalValue' : {
        'Calories' : 160,
        'Lipides' : 2.5,
        'Cholesterol' : 0.01,
        'Sodium' : 0.075,
        'Glucides' : 25,
        'Proteines' : 8,
        'Vitamine' : 'A, C',
        'Calcium' : 20,
        'Fer' : 0
    },
    'Approved' : 'N'
});

db.variety.insert({
    'Name' : 'Iron',
    'Origin' : 'France',
    'Location' : [],
    'Label' : [],
    'Price' : 0,
    'NutritionalValue' : {
        'Calories' : 10,
        'Lipides' : 5.5,
        'Cholesterol' : 1.01,
        'Sodium' : 0.045,
        'Glucides' : 50,
        'Proteines' : 8,
        'Vitamine' : 'A',
        'Calcium' : 100,
        'Fer' : 666
    },
    'Approved' : 'Y'
});

db.variety.insert({
    'Name' : 'Made In China',
    'Origin' : 'Chine',
    'Location' : [],
    'Label' : [],
    'Price' : 0,
    'NutritionalValue' : {
        'Calories' : 0,
        'Lipides' : 0,
        'Cholesterol' : 0,
        'Sodium' : 0,
        'Glucides' : 5,
        'Proteines' : 8,
        'Vitamine' : 'Fake',
        'Calcium' : 0,
        'Fer' : 0
    },
    'Approved' : 'Y'
});

db.variety.insert({
    'Name' : 'Snow White',
    'Origin' : 'America',
    'Location' : [],
    'Label' : [],
    'Price' : 0,
    'NutritionalValue' : {
        'Calories' : 160,
        'Lipides' : 2.5,
        'Cholesterol' : 0.01,
        'Sodium' : 0.075,
        'Glucides' : 25,
        'Proteines' : 8,
        'Vitamine' : 'A, C',
        'Calcium' : 20,
        'Fer' : 0
    },
    'Approved' : 'N'
});

// ================================================================== INGREDIENTS ==================================================================
db.ingredients.insert({
    'Name' : 'Pomme',
    'Season' : 'All',
    'Variety' : [],
    'Approved' : 'N'
});

db.ingredients.insert({
    'Name' : 'Poire',
    'Season' : 'Winter',
    'Variety' : [],
    'Approved' : 'N'
});

db.ingredients.insert({
    'Name' : 'Meat',
    'Season' : 'Summer',
    'Variety' : [],
    'Approved' : 'Y'
});

db.ingredients.insert({
    'Name' : 'Potatoes',
    'Season' : 'Summer',
    'Variety' : [],
    'Approved' : 'Y'
});

// ================================================================== RECIPES ==================================================================
db.recipes.insert({
    'Name' : 'Made in China',
    'Description' : 'Totally Made In China',
    'Difficulty' : 2,
    'Origin' : 'Asia',
    'MakingTime' : 789451,
    'CookingTime' : 45671,
    'Mark' : 7,
    'Ingredient' : [],
    'Comment' : [],
    'HowToDo' : [],
    'Photos' : []
});

db.recipes.insert({
    'Name' : 'Made in France',
    'Description' : 'Fait en France',
    'Difficulty' : 10,
    'Origin' : 'France',
    'MakingTime' : 787777451,
    'CookingTime' : 666,
    'Mark' : 752,
    'Ingredient' : [],
    'Comment' : [],
    'HowToDo' : [],
    'Photos' : []
});

db.recipes.insert({
    'Name' : 'Made in thailand',
    'Description' : 'Not sure if a girl or a boya',
    'Difficulty' : 100,
    'Origin' : 'Thai',
    'MakingTime' : 751,
    'CookingTime' : 4544671,
    'Mark' : 0,
    'Ingredient' : [],
    'Comment' : [],
    'HowToDo' : [],
    'Photos' : []
});

db.recipes.insert({
    'Name' : 'Made in America',
    'Description' : 'Fake in China',
    'Difficulty' : 2,
    'Origin' : 'France',
    'MakingTime' : 789451,
    'CookingTime' : 45671,
    'Mark' : 7,
    'Ingredient' : [],
    'Comment' : [],
    'HowToDo' : [],
    'Photos' : []
});

// ================================================================== PRODUCTS ==================================================================
db.products.insert({
    'Name' : 'Pomme',
    'Description' : 'titi',
    'Price' : 7894,
    'Recipes' : [],
    'Locations' : [],
    'Origin' : [],
    'Label' : [],
    'Photos' : []
});

db.products.insert({
    'Name' : 'Poulet',
    'Description' : 'Cot cot',
    'Price' : 7894,
    'Recipes' : [],
    'Locations' : [],
    'Origin' : [],
    'Label' : [],
    'Photos' : []
});

db.products.insert({
    'Name' : 'Cow',
    'Description' : 'meu meu meuhhhhhh',
    'Price' : 7894,
    'Recipes' : [],
    'Locations' : [],
    'Origin' : [],
    'Label' : [],
    'Photos' : []
});

// ================================================================== ACCOUNT ==================================================================
db.account.insert({
    'Login' : 'Julian25000',
    'Password' : 'hello',
    'FirstName' : 'Julian',
    'LastName' : 'HO QUANG',
    'Age' : '24',
    'Gender' : 'M',
    'Email' : 'Ju@li.an',
    'Restriction' : [],
    'Location' : 'Suisse',
    'Favorites' : [],
    'Visibility' : 'ON'
});

db.account.insert({
    'Login' : 'PYF',
    'Password' : 'pafpouf',
    'FirstName' : 'Pierre-Yves',
    'LastName' : 'Fare',
    'Age' : '22',
    'Gender' : 'M',
    'Email' : 'P@Y.F',
    'Restriction' : [],
    'Location' : 'Afrique',
    'Favorites' : [],
    'Visibility' : 'ON'
});

db.account.insert({
    'Login' : 'CMorgane',
    'Password' : 'Momo',
    'FirstName' : 'Clara',
    'LastName' : 'M',
    'Age' : '80',
    'Gender' : 'F',
    'Email' : 'a@a.a',
    'Restriction' : [],
    'Location' : 'Chine',
    'Favorites' : [],
    'Visibility' : 'ON'
});

db.account.insert({
    'Login' : 'Aziz',
    'Password' : 'light',
    'FirstName' : 'A',
    'LastName' : 'Ziz',
    'Age' : '8',
    'Gender' : 'M',
    'Email' : 'b@b.b',
    'Restriction' : [],
    'Location' : 'Egypt',
    'Favorites' : [],
    'Visibility' : 'OFF'
});
