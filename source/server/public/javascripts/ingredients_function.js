/**
 * Created by Julian on 01/11/2014.
 */


// Userlist data array for filling in info box
var ingredientsListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#ingredientsList table tbody').on('click', 'td a.linkshowingredients', showIngredientInfo);

    // Add Ingredients button click
    $('#btnAddIngredients').on('click', addIngredients);

    // Delete Ingredients link click
    $('#ingredientsList table tbody').on('click', 'td a.linkdeleteingredients', deleteIngredients);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';


     // jQuery AJAX call for JSON
    $.getJSON( '/ingredients/ingredientslist', function( data ) {
        // Stick our user data array into a userlist variable in the global object
        ingredientsListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowingredients" rel="' + this.Name + '" title="Show Details">' + this.Name + '</a></td>';
            tableContent += '<td>' + this.Season + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteingredients" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#ingredientsList table tbody').html(tableContent);
    });
};

// Show Ingredient Info
function showIngredientInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve name from link rel attribute
    var thisIngredientsName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = ingredientsListData.map(function(arrayItem) { return arrayItem.Name; }).indexOf(thisIngredientsName);

    // Get our User Object
    var thisIngredientsObject = ingredientsListData[arrayPosition];

    //Populate Info Box
    $('#ingredientsInfoVariety').text(thisIngredientsObject.Variety);

};

// Add Ingredients
function addIngredients(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addIngredients input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newIngredients = {
            'Name': $('#addIngredients fieldset input#inputIngredientsName').val(),
            'Season': $('#addIngredients fieldset input#inputIngredientsSeason').val(),
            'Variety': $('#addIngredients fieldset input#inputIngredientsVariety').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newIngredients,
            url: '/ingredients/addingredients',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addIngredients fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete Ingredients
function deleteIngredients(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this ingredients?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/ingredients/deleteingredients/' + $(this).attr('rel')
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
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};
