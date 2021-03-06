/**
 * Created by Julian on 02/11/2014.
 */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var formidable = require('formidable');
var BSON = mongo.BSONPure;
var fs = require('fs');
var errorCodes = require('../lib/error_code.js');
var Auth = require('../lib/auth_control.js');
var RecipeControl =  require('../lib/recipe_control.js');
// ====================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ====================================================================================================================================
///*
// * GET recipeslist.
// */
router.get('/list', function(req, res, next) {
    var db = req.db;
    db.collection('recipes').find().toArray(function (err, items) {
        if (err) {
            console.log("Error while retrieving recipe list: " + err);
            next(new Error(err));
        }
        res.json({"request": "success", "recipes": items});
    });
});
// ====================================================================================================================================

/*
 * Get a Recipe
 * Code:
 *      0 : All Clear
 */
router.get('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var idRecip = req.params.id;

        if (!(CheckBson.test(idRecip)))
            res.status(404).send({request: "error", code: errorCodes.recipe.getNotFound, info: "Recipe could not be found."});
        var db = req.db;
        db.collection('recipes').findById(idRecip, function (err_collection, recipes_res) {
            if (err_collection)
                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
            else if (recipes_res == null)
                res.status(404).send({request: "error", code: errorCodes.recipe.getNotFound, info: "Recipe could not be found."});
            else
                res.status(200).json({request: "success", recipe: recipes_res});
        });
    });
});

/*
 * Create a Recipe
 * Code:
 *      0 : All Clear
 */
router.post('/', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var checkError;
            var name = formInfos.name;
            var description = formInfos.description;
            var picture = files.picture;
            var mt = formInfos.make_time;
            var ct = formInfos.cooking_time;
            var instruction = formInfos.instruction;
            var foods = formInfos.foods;

            if ((checkError = RecipeControl.CheckFieldCreate(name, "name")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(description, "description")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(mt, "make_time")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(ct, "cooking_time")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(instruction, "instruction")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckPicture(picture)).code != 0)
                return (res.status(400).send(checkError));


            if (foods != undefined)
            {
                try {
                    if (/^[\],:{}\s]*$/.test(foods.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                        foods = JSON.parse(formInfos.foods);
                    else
                        return (res.status(400).send({request: "error", code: errorCodes.recipe.invalidField, message: "The field 'foods' is invalid. Not the format of a JSON"}));
                } catch (e){
                    return (res.status(400).send({request: "error", code: errorCodes.recipe.invalidField, message: "The field 'foods' is invalid. Not the format of a JSON"}));
                }
            }
            else
                return (res.status(400).send({request: "error", code: errorCodes.recipe.missingField, message: "The field 'foods' is mandatory and has not been specified."}));

            if (typeof(foods) != "object")
                return (res.status(400).send({request: "error", code: errorCodes.recipe.invalidField, message: "The field 'foods' is invalid. Not the format of a JSON"}));

            RecipeControl.CheckIngredientsList(foods, req, res, function()
            {
                var db = req.db;
                var new_recipe = { name: name, description: description, make_time: mt, cooking_time : ct, instruction: instruction, foods: foods};
                db.collection("recipes", function(err_collection, recipes_collection)
                {
                    if (err_collection)
                        res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                    else if (recipes_collection == null)
                        res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                    else
                    {
                        recipes_collection.insert(new_recipe, function(err_insert, insert_res)
                        {
                            if (err_insert)
                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                            else if (insert_res == null)
                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                            else
                            {
                                var new_picture_url = RecipeControl.GetNewPictureName(picture.name, insert_res[0]._id).url;
                                fs.rename(picture.path, new_picture_url, function (err_rename)
                                {
                                    if (err_rename)
                                        res.status(errorCodes.undetermined.statusPermissionFile).send({request: "error", code: errorCodes.undetermined.codePermissionFile, message: "Can't save the file"});
                                    else
                                    {
                                        recipes_collection.update({_id : insert_res[0]._id} , {$set : {picture : new_picture_url}}, function (err_update, update_done)
                                        {
                                            if (err_update)
                                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                            else if (update_done != 1)
                                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                            else
                                            {
                                                insert_res[0].picture = new_picture_url;
                                                res.status(201).send({request: "success", recipe: insert_res[0]});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });
});

/*
 * Edit a Recipe
 * Code:
 *      0 : All Clear
 */
router.put('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();
        form.parse(req, function (error, formInfos, files) {
            if (Object.keys(formInfos).length == 0 && Object.keys(files).length == 0)
                return (res.status(400).send({request: "error", code: errorCodes.recipe.editNothing, message: "Nothing to update."}));
            var checkError;
            var name = formInfos.name;
            var description = formInfos.description;
            var picture = files.picture;
            var mt = formInfos.make_time;
            var ct = formInfos.cooking_time;
            var instruction = formInfos.instruction;
            var foods = formInfos.foods;
            if (foods != undefined)
                if (/^[\],:{}\s]*$/.test(foods.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    foods = JSON.parse(formInfos.foods);
                else
                    return (res.status(400).send({request: "error", code: errorCodes.recipe.invalidField, message: "The field 'foods' is invalid. Not the format of a JSON"}));

            if ((checkError = RecipeControl.CheckFieldCreate(name, "name")).code == errorCodes.recipe.invalidField)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(description, "description")).code == errorCodes.recipe.invalidField)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(mt, "make_time")).code == errorCodes.recipe.invalidField)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(ct, "cooking_time")).code == errorCodes.recipe.invalidField)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(instruction, "instruction")).code == errorCodes.recipe.invalidField)
                return (res.status(400).send(checkError));
            checkError = RecipeControl.CheckPicture(picture);
            if (!(checkError.code == 0 || checkError.code == undefined))
                return (res.status(400).send(checkError));
            // @TODO change edit systeme of recipes
            RecipeControl.CheckIngredientsList(foods, req, res, function()
            {
                var db = req.db;
                var idRecipe = req.params.id;
                if (!CheckBson.test(idRecipe))
                    return (res.status(404).send({request: "error", code: errorCodes.recipe.editNotFound, message: "Recipe could not be found."}));
                db.collection("recipes", function(err_collection, recipes_collection){
                    if (err_collection)
                        return (res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"}));
                    recipes_collection.findOne({_id: BSON.ObjectID(idRecipe)}, function(err_find, recipe_found){
                        if (err_find)
                            return (res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"}));
                        else if (recipe_found == null)
                            return (res.status(404).send({request: "error", code: errorCodes.recipe.editNotFound, message: "Recipe could not be found."}));
                        else
                        {
                            var update_recipe = {};
                            if (name != undefined)
                                update_recipe.name = name;
                            if (description != undefined)
                                update_recipe.description = description;
                            if (mt != undefined)
                                update_recipe.make_time = mt;
                            if (ct != undefined)
                                update_recipe.cooking_time = ct;
                            if (instruction != undefined)
                                update_recipe.instruction = instruction;
                            if (foods != undefined)
                                update_recipe.foods = foods;
                            if (picture != undefined)
                            {
                                var new_picture_url = RecipeControl.GetNewPictureName(picture.name, recipe_found._id).url;
                                if (typeof recipe_found.picture == "string")
                                    fs.unlink(recipe_found.picture);
                                fs.rename(picture.path, new_picture_url, function (err_rename)
                                {
                                    if (err_rename)
                                        return (res.status(errorCodes.undetermined.statusPermissionFile).send({request: "error", code: errorCodes.undetermined.codePermissionFile, message: "Can't save the file"}));
                                });
                                update_recipe.picture = new_picture_url;
                            }
                            recipes_collection.update({ _id : recipe_found._id }, { $set : update_recipe }, function(err_update, recipe_updated) {
                                if (err_update)
                                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                else if (recipe_updated != 1)
                                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                else
                                {
                                    var new_recipe_updated = {};
                                    for (var _old in recipe_found)
                                        new_recipe_updated[_old] = recipe_found[_old];
                                    for (var _new in update_recipe)
                                        new_recipe_updated[_new] = update_recipe[_new];
                                    res.status(201).send({request: "success", user: new_recipe_updated});
                                }
                            });
                        }
                    });
                });
            });
        });
    });
});

/*
 * Delete a Recipe
 * Code:
 *      0 : All Clear
 */
router.delete('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var db = req.db;
        db.collection('recipes', function(err_collection, recipes_collection) {
            if (err_collection)
                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
            else
            {
                var idRecipe = req.params.id;
                recipes_collection.findOne({ _id : BSON.ObjectID(idRecipe)}, function (err_find, recipe_found) {
                    if (err_find)
                        res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                    if (recipe_found === null)
                        res.status(404).send({ request: "error", code: errorCodes.recipe.removeNotFound, info: "Recipe could not be found." });
                    else
                    {
                        recipes_collection.remove({ _id : recipe_found._id}, function(err_del, res_del){
                            if (err_del)
                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                            else if (res_del != 1)
                                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                            else
                            {
                                if (typeof recipe_found.picture == "string")
                                    fs.unlink(recipe_found.picture);

                                // Deleting associated comments
                                if (typeof recipe_found.comments !== "undefined" &&
                                    recipe_found.comments != null &&
                                    recipe_found.comments.length > 0) {
                                    var comments = db.collection("comments");
                                    for (var i = 0; i < recipe_found.comments.length; i++) {
                                        console.log(recipe_found.comments[i]);
                                        comments.removeById(recipe_found.comments[i]._id, function(err, count) {
                                            if (err) {
                                                console.log("Error while deleting comments: " + err);
                                                next(new Error(err));
                                            }
                                        });
                                    }
                                }
                                res.status(200).send({request: "success", message: "deleted"});
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post('/comment', function(req, res, next) {
    Auth.CheckAuth(req, res, function() {
        var token = req.query.t;
        var db = req.db;
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log("Formidable form parse error: " + err);
                res.status(500).json({"request": "error"});
            }
            else {

                // Validate request
                var recipeId = fields.recipe_id;
                var message = fields.message;

                if (typeof recipeId === "undefined")
                    res.status(400).json({"request": "error", "code": errorCodes.recipe.missingField, "message": "The field 'recipe_id' is mandatory and has not been specified."});
                else if (recipeId === null || (/^\s*$/).test(recipeId)) // Check if null, empty or white space
                    res.status(400).json({"request": "error", "code": errorCodes.recipe.invalidField, "message": "The field 'recipe_id' is invalid."});
                else {
                    if (typeof message === "undefined")
                        res.status(400).json({"request": "error", "code": errorCodes.recipe.missingField, "message": "The field 'message' is mandatory and has not been specified."});
                    else if (message === null || (/^\s*$/).test(message)) // Check if null, empty or white space
                        res.status(400).json({"request": "error", "code": errorCodes.recipe.invalidField, "message": "The field 'message' is invalid."});
                    else {

                        // Validate recipe existence
                        db.collection("recipes").findById(recipeId, function (err, recipe) {
                            if (err) {
                                console.log("Error while searching recipes: " + err);
                                next(new Error(err));
                            }
                            else if (!recipe)
                                res.status(200).json({"request": "error", "code": errorCodes.recipe.notFound, "message": "Recipe could not be found."});
                            else{

                                // Comment
                                db.collection("user").find({auth_token: token}, {}).toArray(function(err, users) {
                                    if (err) {
                                        console.log("Error while searching user: " + err);
                                        next(new Error(err));
                                    }
                                    else if (users.length == 0)
                                        res.status(400).json({"request": "error", "code": errorCodes.api.invalidToken, "message": "No user is authenticated with the token provided."});
                                    else {
                                        var user = users[0];

                                        db.collection("comments").insert({
                                            "recipe_id": recipeId,
                                            "creation_date": new Date(),
                                            "message": message,
                                            "user": {"_id": user._id, "pseudo": user.pseudo}
                                        }, function (err, records) {
                                            if (err) {
                                                console.log("Error while inserting comment: " + err);
                                                next(new Error(err));
                                            }
                                            else if (records.length == 0) {
                                                console.log("Error while inserting comment: " + err);
                                                next(new Error(err));
                                            }
                                            else {

                                                // Updating recipe
                                                var comment = records[0];

                                                delete comment.recipe_id;
                                                db.collection("recipes").updateById(recipeId, {$push: {comments: comment}}, function(err, count, status) {
                                                    if (err) {
                                                        console.log("Recipe update error: " + err);

                                                        // Prevent an inconsistent state
                                                        db.collection("comments").remove(records[0], function(err, count) {
                                                            if (err) {
                                                                console.log("Error while deleting comment: " + comment + ": " + err);
                                                            }
                                                        });
                                                        next(new Error(err));
                                                    }
                                                    else
                                                        res.status(201).json({"request": "success", "comment": comment});
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    });
});

router.delete('/comment/:id', function(req, res, next) {
    Auth.CheckAuth(req, res, function() {
        var commentId = req.params.id;
        var db = req.db;

        db.collection("comments").findById(commentId, function(err, comment) {
            if (err) {
                console.log("Error while searching comment: " + err);
                next(new Error(err));
            }
            else if (!comment)
                res.status(404).json({"request": "error", "code": errorCodes.recipe.commentNotFound, "message": "Comment could not be found."});
            else {

                // Updating recipe
                db.collection("recipes").update({_id: new mongo.ObjectID(comment.recipe_id)}, {$pull: {comments: {_id: comment._id}}}, function(err, recipe) {
                    if (err) {
                        console.log("Error while updating recipe: " + err);
                        next(new Error(err));
                    }

                    // Deleting comment
                    db.collection("comments").remove(comment, function () {
                        if (err) {
                            console.log("Error while removing comment: " + err);
                            next(new Error(err));
                        }
                        res.status(200).json({"request": "success"});
                    });
                });
            }
        });
    });
});

module.exports = router;