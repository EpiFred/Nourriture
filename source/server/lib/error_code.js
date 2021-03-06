/**
 * Created by Julian on 07/01/2015.
 */

var codes = {
    undetermined: {
        codeDB: 1,
        statusPermissionFile: 1,
        codePermissionFile: 1
    },
    api: {
        unauthorized: 100,
        expiredToken: 101,
        noSuchFile: 102,
        notAnImage: 103,
        invalidToken: 104,
        statusDB: 500
    },
    user: {
        missingField: 201,
        invalidField: 202,
        badLogin: 203,
        idNotFound: 204,
        alreadyExist: 205,
        syntaxEmail: 206,
        badPasswordEdit: 207,
        emailAlreadyUsed: 208,
        editPassword: 209,
        editNothing: 210,
        recipeNotFound: 211,
        recipeAlreadyInFavorites: 212
    },
    recipe: {
        missingField: 301,
        invalidField: 302,
        notFound: 303,
        getNotFound: 303,
        createNoFood: 304,
        foodDoesNotExist: 305,
        invalidFoodsList: 306,
        foodsNameDoesNotMatch: 307,
        editNotFound: 308,
        removeNotFound: 309,
        editNothing: 310,
        commentNotFound: 311
    },
    food: {
        missingField: 401,
        invalidField: 402,
        getNotFound: 403,
        editNotFound: 404,
        deleteNotFound: 405
    },
    search: {
        invalidField: 502
    }
};

module.exports = codes;