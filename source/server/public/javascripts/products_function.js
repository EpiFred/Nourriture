/**
 * Created by Julian on 02/11/2014.
 */
// Userlist data array for filling in info box
var productsListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#productsList table tbody').on('click', 'td a.linkshowproducts', showProductInfo);
/*
    // Add products button click
    $('#btnAddProducts').on('click', addProducts);
*/
    // Delete Products link click
    $('#productsList table tbody').on('click', 'td a.linkdeleteproducts', deleteIngredients);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';


    // jQuery AJAX call for JSON
    $.getJSON( 'products/productslist', function( data ) {
        // Stick our user data array into a productslist variable in the global object
        productsListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowproducts" rel="' + this.Name + '" title="Show Details">' + this.Name + '</a></td>';
            tableContent += '<td>' + this.Season + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteproducts" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#productsList table tbody').html(tableContent);
    });
};

// Show product Info
function showProductInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve name from link rel attribute
    var thisProductsName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = productsListData.map(function(arrayItem) { return arrayItem.Name; }).indexOf(thisProductsName);

    // Get our User Object
    var thisProductsObject = productsListData[arrayPosition];

    //Populate Info Box
    $('#productsInfoVariety').text(thisProductsObject.Variety);

};
