/**
 * Created by Julian on 02/11/2014.
 */
// Recipe list data array for filling in info box
var recipesListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the recipe table on initial page load
    populateTable();

    // Recipe name link click
    $('#recipesList table tbody').on('click', 'td a.linkshowrecipes', showRecipeInfo);
/*
    // Add recipe button click
    $('#btnAddRecipes').on('click', addRecipes);
*/
    // Delete recipes link click
    $('#recipesList table tbody').on('click', 'td a.linkdeleterecipes', deleteRecipes);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';


    // jQuery AJAX call for JSON
    $.getJSON( '/recipes/recipeslist', function( data ) {
        // Stick our user data array into a recipeslist variable in the global object
        recipesListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowrecipes" rel="' + this.Name + '" title="Show Details">' + this.Name + '</a></td>';
            tableContent += '<td>' + this.Difficulty + '</td>';
            tableContent += '<td>' + this.Mark + '</td>';
            tableContent += '<td><a href="#" class="linkdeleterecipes" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#recipesList table tbody').html(tableContent);
    });
};

// Show Ingredient Info
function showRecipeInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve name from link rel attribute
    var thisRecipesName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = recipesListData.map(function(arrayItem) { return arrayItem.Name; }).indexOf(thisRecipesName);

    // Get our User Object
    var thisRecipesObject = recipesListData[arrayPosition];

    //Populate Info Box
    $('#recipesInfoIngredients').text(thisRecipesObject.Ingredients);
    $('#recipesInfoOrigin').text(thisRecipesObject.Origin);
    $('#recipesInfoMakingTime').text(thisRecipesObject.MakingTime);
    $('#recipesInfoCookingTime').text(thisRecipesObject.CookingTime);
    $('#recipesInfoPhotos').text(thisRecipesObject.Photos);
    $('#recipesInfoComment').text(thisRecipesObject.Comment);
    $('#recipesInfoDescription').text(thisRecipesObject.Description);
    $('#recipesInfoHowToDo').text(thisRecipesObject.HowToDo);

};


// Delete Recipes
function deleteRecipes(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this recipe?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/recipes/deleterecipes/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
            // Update the table
            populateTable();
        });
    }
    else
    {
        // If they said no to the confirm, do nothing
        return false;
    }
};
