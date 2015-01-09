var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var mongo = require("mongodb");
var BSON = mongo.BSONPure;
var CodeError = require('../public/javascripts/error_code.js');
var Auth = require('../public/javascripts/auth_control.js');
var FoodControl =  require('../public/javascripts/food_control.js');
// ===============================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ===============================================================================================================================================
/*
 * Get a Food
 * Code:
 *      0 : All Clear
 */
router.get('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var idFood = req.params.id;

        if (!(CheckBson.test(idFood)))
            res.status(404).send({request: "error", code: CodeError.CodeFoodGetNotFound, info: "Food could not be found."});
        var db = req.db;
        db.collection('food').findById(idFood, function (err_collection, food_res) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else if (food_res == null)
                res.status(404).send({request: "error", code: CodeError.CodeFoodGetNotFound, info: "Food could not be found."});
            else
                res.status(201).send({request: "success", recipe: food_res});
        });
    });
});

/*
 * Create a Food
 * Code:
 *      0 : All Clear
 */
router.post('/:t', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var checkError;
            var name = formInfos.name;
            // @TODO Manage picture
            var picture = formInfos.picture;
            var nutritional_values = formInfos.nutritional_values;

            if (/^[\],:{}\s]*$/.test(nutritional_values.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                nutritional_values = JSON.parse(formInfos.nutritional_values);
            else
                return (res.status(400).send({request: "error", code: CodeError.CodeFoodFieldInvalid, message: "The field 'nutritional_values' is invalid. Not the format of a JSON"}));

            if ((checkError = FoodControl.CheckFieldCreate(name, "name")).code != 0)
                return (res.status(400).send(checkError));

            var db = req.db;
            var new_food = {name: name, picture: picture, nutritional_values: nutritional_values};
            db.collection("food").insert(new_food, function(err_insert, insert_res)
            {
                if (err_insert)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else if (insert_res == null)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else
                    res.status(201).send({request: "success", recipe: insert_res[0]});
            });
        });
    });
});

/*
 * Edit a Food
 * Code:
 *      0 : All Clear
 */
router.put('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var checkError;
            var idFood = req.params.id;
            var name = formInfos.name;
            // @TODO Manage picture
            var picture = formInfos.picture;
            var nutritional_values = formInfos.nutritional_values;

            if (nutritional_values != undefined && nutritional_values != "")
                if (/^[\],:{}\s]*$/.test(nutritional_values.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    nutritional_values = JSON.parse(formInfos.nutritional_values);
                else
                    return (res.status(400).send({request: "error", code: CodeError.CodeFoodFieldInvalid, message: "The field 'nutritional_values' is invalid. Not the format of a JSON"}));

            if (!(CheckBson.test(idFood)))
                res.status(404).send({request: "error", code: CodeError.CodeFoodGetNotFound, info: "Food could not be found."});
            if ((checkError = FoodControl.CheckFieldCreate(name, "name")).code == CodeError.CodeFoodFieldInvalid)
                return (res.status(400).send(checkError));

            var db = req.db;
            db.collection("food", function (err_collection, food_collection)
            {
                if (err_collection)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else if (food_collection == null)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else
                {
                    food_collection.findOne({_id : BSON.ObjectID(idFood)}, function(err_find, food_found)
                    {
                        if (err_find)
                            res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                        else if (food_found == null)
                            res.status(404).send({request: "error", code: CodeError.CodeFoodEditNotFound, info: "Food could not be found."});
                        else
                        {
                            var updated_food = {};
                            if (name != undefined)
                                updated_food.name = name;
                            if (picture != undefined)
                                updated_food.picture = picture;
                            if (nutritional_values != undefined)
                            {
                                // @TODO Check if the nv is a correct json
                                var old_nv = food_found.nutritional_values;
                                //if (/^[\],:{}\s]*$/.test(old_nv.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                                //    old_nv = JSON.parse(food_found.nutritional_values);
                                //else
                                //    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error - json format nv"});
                                var new_nv = {};
                                for (var _old in old_nv)
                                    new_nv[_old] = old_nv[_old];
                                for (var _obj in nutritional_values)
                                    new_nv[_obj] = nutritional_values[_obj];
                                updated_food.nutritional_values = new_nv;
                            }
                            food_collection.update({ _id : food_found._id }, { $set : updated_food }, function(err_update, food_updated) {
                                if (err_update)
                                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                else if (food_updated != 1)
                                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                else
                                    res.status(201).send({request:"success", food: updated_food});
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
router.delete('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var db = req.db;
        db.collection("food", function(err_collection, food_collection)
        {
           if (err_collection)
               res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
           else if (food_collection == null)
               res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
           else
           {
               var idFood = req.params.id;
               food_collection.findOne({_id : BSON.ObjectID(idFood)}, function(err_find, food_found)
               {
                  if (err_find)
                      res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                  else if (food_found == null)
                      res.status(404).send({request: "error", code: CodeError.CodeFoodEditNotFound, info: "Food could not be found."});
                  else
                  {
                      food_collection.remove({ _id : food_found._id}, function(err_del, res_del){
                          if (err_del)
                              res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                          else if (res_del != 1)
                              res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                          else
                              res.status(201).send("deleted");
                      });
                  }
               });
           }
        });
    });
});
// ========================================================================== OLD =============================================================================
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('food').find().toArray(function (err, items) {
        res.json(items);
    });
});
// ============================================================================================================================================================
module.exports = router;