var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var mongo = require("mongodb");
var BSON = mongo.BSONPure;
var fs = require('fs');
var errorCodes = require('../lib/error_code.js');
var Auth = require('../lib/auth_control.js');
var FoodControl =  require('../lib/food_control.js');
// ===============================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ===============================================================================================================================================
// ========================================================================== OLD ================================================================
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('food').find().toArray(function (err, items) {
        res.json(items);
    });
});
// ========================================================================== OLD ================================================================
/*
 * Get a Food
 * Code:
 *      0 : All Clear
 */
router.get('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var idFood = req.params.id;

        if (!(CheckBson.test(idFood)))
            res.status(404).send({request: "error", code: errorCodes.food.getNotFound, info: "Food could not be found."});
        var db = req.db;
        db.collection('food').findById(idFood, function (err_collection, food_res) {
            if (err_collection)
                res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
            else if (food_res == null)
                res.status(404).send({request: "error", code: errorCodes.food.getNotFound, info: "Food could not be found."});
            else
                res.status(201).send({request: "success", food: food_res});
        });
    });
});

/*
 * Create a Food
 * Code:
 *      0 : All Clear
 */
router.post('/', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var checkError;
            var name = formInfos.name;
            var picture = files.picture;
            var nutritional_values = formInfos.nutritional_values;

            if (nutritional_values != undefined)
                if (/^[\],:{}\s]*$/.test(nutritional_values.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    nutritional_values = JSON.parse(formInfos.nutritional_values);
                else
                    return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'nutritional_values' is invalid. Not the format of a JSON"}));

            if ((checkError = FoodControl.CheckFieldCreate(name, "name")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = FoodControl.CheckPicture(picture)).code != 0)
                return (res.status(400).send(checkError));

            var db = req.db;
            db.collection("food", function(err_collection, food_collection){
                if (err_collection)
                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                else if (food_collection == null)
                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                else
                {
                    var new_food = {name: name, nutritional_values: nutritional_values};
                    food_collection.insert(new_food, function(err_insert, insert_res)
                    {
                        if (err_insert)
                            res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                        else if (insert_res == null)
                            res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                        else
                        {
                            var new_picture_url = FoodControl.GetNewPictureName(picture.name, insert_res[0]._id).url;
                            fs.rename(picture.path, new_picture_url, function (err_rename)
                            {
                                if (err_rename)
                                    res.status(errorCodes.undetermined.statusPermissionFile).send({request: "error", code: errorCodes.undetermined.codePermissionFile, message: "Can't save the file"});
                                else
                                {
                                    food_collection.update({_id : insert_res[0]._id} , {$set : {picture : new_picture_url}}, function (err_update, update_done)
                                    {
                                        if (err_update)
                                            res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                        else if (update_done != 1)
                                            res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                        else
                                        {
                                            insert_res[0].picture = new_picture_url;
                                            res.status(201).send({request: "success", food: insert_res[0]});
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            })
        });
    });
});

/*
 * Edit a Food
 * Code:
 *      0 : All Clear
 */
router.put('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            if (Object.keys(formInfos).length == 0 && Object.keys(files).length == 0)
                return (res.status(400).send({request: "error", code: errorCodes.recipes.editNothing, message: "Nothing to update."}));
            var checkError;
            var idFood = req.params.id;
            var name = formInfos.name;
            var picture = files.picture;
            var nutritional_values = formInfos.nutritional_values;

            if (nutritional_values != undefined && nutritional_values != "")
                if (/^[\],:{}\s]*$/.test(nutritional_values.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    nutritional_values = JSON.parse(formInfos.nutritional_values);
                else
                    return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'nutritional_values' is invalid. Not the format of a JSON"}));

            if (!(CheckBson.test(idFood)))
                res.status(404).send({request: "error", code: errorCodes.food.getNotFound, info: "Food could not be found."});
            if ((checkError = FoodControl.CheckFieldCreate(name, "name")).code == errorCodes.food.invalidField)
                return (res.status(400).send(checkError));
            checkError = FoodControl.CheckPicture(picture);
            if (!(checkError.code == 0 || checkError.code == undefined))
                return (res.status(400).send(checkError));

            var db = req.db;
            db.collection("food", function (err_collection, food_collection)
            {
                if (err_collection)
                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                else if (food_collection == null)
                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                else
                {
                    food_collection.findOne({_id : BSON.ObjectID(idFood)}, function(err_find, food_found)
                    {
                        if (err_find)
                            res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                        else if (food_found == null)
                            res.status(404).send({request: "error", code: errorCodes.food.editNotFound, info: "Food could not be found."});
                        else
                        {
                            var updated_food = {};
                            if (name != undefined)
                                updated_food.name = name;
                            if (picture != undefined)
                            {
                                var new_picture_url = FoodControl.GetNewPictureName(picture.name, food_found._id).url;
                                if (typeof food_found.picture == "string")
                                    fs.unlink(food_found.picture);
                                fs.rename(picture.path, new_picture_url, function (err_rename)
                                {
                                    if (err_rename)
                                        return (res.status(errorCodes.undetermined.statusPermissionFile).send({request: "error", code: errorCodes.undetermined.codePermissionFile, message: "Can't save the file"}));
                                });
                                updated_food.picture = new_picture_url;
                            }
                            if (nutritional_values != undefined)
                            {
                                // @TODO Check if the nv is a correct json
                                var old_nv = food_found.nutritional_values;
                                //if (/^[\],:{}\s]*$/.test(old_nv.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                                //    old_nv = JSON.parse(food_found.nutritional_values);
                                //else
                                //    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error - json format nv"});
                                var new_nv = {};
                                for (var _old in old_nv)
                                    new_nv[_old] = old_nv[_old];
                                for (var _obj in nutritional_values)
                                    new_nv[_obj] = nutritional_values[_obj];
                                updated_food.nutritional_values = new_nv;
                            }
                            food_collection.update({ _id : food_found._id }, { $set : updated_food }, function(err_update, food_updated) {
                                if (err_update)
                                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                else if (food_updated != 1)
                                    res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                                else
                                    res.status(200).send({request:"success", food: updated_food});
                            });
                        }
                    });
                }
            });
        });
    });
});

/*
 * Delete a Food
 * Code:
 *      0 : All Clear
 */
router.delete('/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var db = req.db;
        db.collection("food", function(err_collection, food_collection)
        {
           if (err_collection)
               res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
           else if (food_collection == null)
               res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
           else
           {
               var idFood = req.params.id;
               food_collection.findOne({_id : BSON.ObjectID(idFood)}, function(err_find, food_found)
               {
                  if (err_find)
                      res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                  else if (food_found == null)
                      res.status(404).send({request: "error", code: errorCodes.food.deleteNotFound, info: "Food could not be found."});
                  else
                  {
                      food_collection.remove({ _id : food_found._id}, function(err_del, res_del){
                          if (err_del)
                              res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                          else if (res_del != 1)
                              res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"});
                          else
                          {
                              if (typeof food_found.picture == "string")
                                  fs.unlink(food_found.picture);
                              res.status(200).send({request: "success", message: "deleted"});
                          }
                      });
                  }
               });
           }
        });
    });
});
// ============================================================================================================================================================
module.exports = router;