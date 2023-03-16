$(document).ready(function () {

    loadItems();
});

// load the items from URL
function loadItems() {
    var itemGrid = $('#itemGrid');
    var itemIdCounter = 1;

    $.ajax({
        type: 'GET',
        url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
        success: function (itemArray) {
            $.each(itemArray, function (index, item) {
                var itemPositionId = itemIdCounter++;
                var itemId = item.id;
                var name = item.name;
                var price = item.price;
                var quantity = item.quantity;

                var button = '<input type="hidden" id="itemButton" />';
                button += '<button type="button"';
                button += 'id="selectButton' + itemId + '"';
                button += 'class="btn btn-outline-primary"';
                button += 'onclick="selectItem(' + itemPositionId + ',' + itemId + ')">';
                button += '<p id="line1">' + itemPositionId + '</p>';
                button += '<p id="line2">' + name + '<br />' + currencyFormat.format(price) + '<br /><br />Quantity Left: ' + quantity + '</p>';
                button += '</button>';

                itemGrid.append(button);
            })
        },
        error: function () {
            $('#errorMessages')
                .append($('<li>')
                .attr({ class: 'list-group-item list-group-item-danger' })
                .text('Error calling web service. List of items not retrieved.'));
        }
    })
}

var currencyFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

//
function makePurchase() {
    $('#messageBox').empty();

    if ($('#itemInput').val() == "") {
        $('#messageBox').val("Please make a selection!"); // When you insert the money and you select Make Purchase.  This will pop up!
    }
    else {
        $.ajax({
            type: 'POST',
            url: 'http://vending.us-east-1.elasticbeanstalk.com/money/' + $('#moneyInput').val() + '/item/' + $('#itemInputId').val(),
            success: function (changeDue) {
                var change = Number(changeDue.quarters);
                change += Number(changeDue.dimes);
                change += Number(changeDue.nickels);
                change += Number(changeDue.pennies);
                if (change === 0) {
                    $('#messageBox').val("Thank you!");
                }
                else {
                    $('#messageBox').val("Thank you!!!");
                    changeMethod(changeDue.quarters, changeDue.dimes, changeDue.nickels, changeDue.pennies);
                }
                resetDisplay();
            },
            error: function (errorResponse) {
                var errorObject = JSON.parse(errorResponse.responseText);
                var message = errorObject.message;
                $('#messageBox').val(message);
            }
        })
    }
}


function selectItem(itemPositionId, itemId) {
    document.getElementById('itemInput').value = itemPositionId;
    document.getElementById('itemInputId').value = itemId;
    $('#changeOutput').val('');
    $('#messageBox').val('');
}

function addMoney(money) {
    document.getElementById('moneyInput').value = parseFloat((+document.getElementById("moneyInput").value) + money).toFixed(2);
    document.getElementById('changeOutput').value = '';
}


function returnChange() {
  var changeReturned = (document.getElementById('moneyInput').value) * 100; // Avoiding float math by using integers
  var quarters = 0;
  var dimes = 0;
  var nickels = 0;
  var pennies = 0;

    while (changeReturned >= 25) {
        changeReturned -= 25;
        quarters++;
    }
    while (changeReturned >= 10) {
        changeReturned -= 10;
        dimes++;
    }
    while (changeReturned >= 5) {
        changeReturned -= 5;
        nickels++;
    }
    while (changeReturned >= 1) {
        changeReturned -= 1;
        pennies++;
    }

    changeMethod(quarters, dimes, nickels, pennies);
    resetDisplay();
    $('#messageBox').val('');
    $('#itemInput').val('');
}

//This method is used for Return Change to create the string display.
function changeMethod(quarters, dimes, nickels, pennies) {
    let changeString = '';

    if (quarters > 0) {
        if (quarters > 1) {
            changeString += quarters + ' quarters';
        }
        else {
            changeString += quarters + ' quarter';
        }
    }

    if (dimes > 0) {
        if (quarters > 0) {
            changeString += ', '
        }
        if (dimes > 1) {
            changeString += dimes + ' dimes';
        }
        else {
            changeString += dimes + ' dime';
        }
    }

    if (nickels > 0) {
        if (quarters > 0 || dimes > 0) {
            changeString += ', '
        }
        if (nickels > 1) {
            changeString += nickels + ' nickels';
        }
        else {
            changeString += nickels + ' nickel';
        }
    }

    if (pennies > 0) {
        if (quarters > 0 || dimes > 0 || nickels > 0) {
            changeString += ', '
        }
        if (pennies > 1) {
            changeString += pennies + ' pennies';
        }
        else {
            changeString += pennies + ' penny';
        }
    }

    document.getElementById('changeOutput').value = changeString;
}

function resetDisplay() {
    $('#moneyInput').val("0.00");
    $('#itemGrid').empty();
    loadItems();
}
