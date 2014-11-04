NPM:
npm install -g <plugin>

BD: ==> Installer Mongo DB (windows / Linux / ... Mac)
Collection "account":
db.account.insert({'Login' : 'log','Password' : 'PW','FirstName' : 'FN','LastName' : 'LN','Age' : 'xx','Gender' : 'M/F','Email' : 'a@a.a','Restriction' : 'R','Location' : 'LA''Favorites' : 'FV'})
ex: db.account.insert(
{
   'Login' : 'log',
   'Password' : 'PW',
   'FirstName' : 'FN',
   'LastName' : 'LN',
   'Age' : 'xx',
   'Gender' : 'M/F',
   'Email' : 'a@a.a',
   'Restriction' : 'R',
   'Location' : 'LA'
   'Favorites' : 'FV'
})

Collection "ingredients":
db.ingredients.insert({'Name' : 'name','Saeson' : 'Summer','Variety' : [ id_V1, id_V2, ...]}
ex: db.ingredients.insert(
{
    'Name' : 'name',
    'Saeson' : 'Summer',
    'Variety' : [ id_V1, id_V2, ...]
})

Collection "variety":
db.variety.insert({'Name' : 'Halal','Origin' : 'Groenland','Locations' : [id_afrique, id_amerique],'Nutritional_value' : {'Calories' : 160,'Lipides' : 2.5, 'Cholesterol' : 0.01,'Sodium' : 0.075,'Glucides' : 25,'Proteines' : 8,'Vitamine' : 'A, C','Calcium' : 20,'Fer' : 0},'Label' : 'OGM!!!','Price' : 100}}
ex: db.variety.insert(
{
    'Name' : 'Halal',
    'Origin' : 'Groenland',
    'Locations' : [id_afrique, id_amerique],
    'Nutritional_value' : {
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
    'Label' : 'OGM!!!',
    'Price' : 100
    }
})

Collection "recipes":
db.recipes.insert({'Name' : 'Made in China','Ingredient' : [123, 456, 789],'Difficulty' : 2,'Origin' : 'France','MakingTime' : 789451,'CookingTime' : 45671,'Mark' : 7,'Photos' : [7891, 7567, 78465, 789564]})
ex: db.recipes.insert(
{
    'Name' : 'Made in China',
    'Ingredient' : [123, 456, 789],
    'Difficulty' : 2,
    'Origin' : 'France',
    'MakingTime' : 789451,
    'CookingTime' : 45671,
    'Mark' : 7,
    'Photos' : [7891, 7567, 78465, 789564]
})

Collection "products":
db.products.insert({'Name' : 'toto','Recipes' : [78456, 89456],'Locations' : [456123, 7894651],'Origin' : 'BLABLA','Label' : 'OMG','Photos' : [1651, 4646, 99871],'Price' : 7894})
ex: db.products.insert(
{
    'Name' : 'toto',
    'Recipes' : [78456, 89456],
    'Locations' : [456123, 7894651],
    'Origin' : 'BLABLA',
    'Label' : 'OMG',
    'Photos' : [1651, 4646, 99871],
    'Price' : 7894
})