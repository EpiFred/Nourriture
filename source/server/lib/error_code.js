/**
 * Created by Julian on 07/01/2015.
 */

// UNDETERMINED
exports.CodeDB = 1;
exports.StatusPermissionFile = 1;
exports.CodePermissionFile = 1;
// GENERAL
exports.CodeUnauthorized = 100;
exports.CodeExpiredToken = 101;
exports.CodeNoSuchFile = 102;
exports.CodeNotAnImage = 103;
exports.StatusDB = 500;
// USER
exports.CodeUserFieldMissing = 201;
exports.CodeUserFieldInvalid = 202;
exports.CodeBadLogin = 203;
exports.CodeUserIdNotFound = 204;
exports.CodeUserAlreadyExist = 205;
exports.CodeSyntaxEmail = 206;
exports.CodeBadPasswordEdit = 207;
exports.CodeEmailAlreadyUsed = 208;
exports.CodeEditPassword = 209;
exports.CodeUserEditNothing = 210;
// RECIPES
exports.CodeRecipeFieldMissing = 301;
exports.CodeRecipeFieldInvalid = 302;
exports.CodeRecipeGetNotFound = 303;
exports.CodeRecipeCreateNoFood = 304;
exports.CodeRecipeFoodDoesNotExist = 305;
exports.CodeRecipeFoodsListInvalid = 306;
exports.CodeRecipeFoodsNameDoesNotMatch = 307;
exports.CodeRecipeEditNotFound = 308;
exports.CodeRecipeRemoveNotFound = 309;
exports.CodeRecipeEditNothing = 310;
// FOOD
exports.CodeFoodFieldMissing = 401;
exports.CodeFoodFieldInvalid = 402;
exports.CodeFoodGetNotFound = 403;
exports.CodeFoodEditNotFound = 404;
exports.CodeFoodDeleteNotFound = 405;
// SEARCH
exports.CodeSearchFieldInvalid = 502;

