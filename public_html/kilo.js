
var db;

$(document).ready(function() {

    $('#createEntry form').submit(createEntry);
    $('#settings form').submit(saveSettings);
    //$('#settings').bind( 'pageAnimationStart', loadSettings );
    $('#dates li a').click(function() {
        var dayOffset = this.id;
        var date = new Date();
        date.setDate(date.getDate() - dayOffset);
        sessionStorage.currentDate = date.getMonth() + 1 + '/' +
                date.getDate() + '/' +
                date.getFullYear();
        refreshEntries();
    });

    var shortName = 'Kilo';
    var version = '1.0';
    var displayName = 'Kilo';
    var maxSize = 65536;

    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(
            function(tx) {
                tx.executeSql(
                        'CREATE TABLE IF NOT EXISTS entries ' +
                        ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                        ' date DATE NOT NULL, food TEXT NOT NULL, ' +
                        ' calories INTEGER NOT NULL );'
                );
            }
    );
});

function createEntry() {

    var date = sessionStorage.currentDate;
    var calories = $('#calories').val();
    var food = $('#food').val();

    db.transaction(
            function(tx) {
                tx.executeSql(
                        'INSERT INTO entries (date, calories, food) VALUES (?, ?, ?);',
                        [date, calories, food],
                        function() {
                            refreshEntries();
                            jQT.goBack();
                        },
                        errorHandler
                        );
            }
    );
    return false;
}

function errorHandler(transaction, error) {
    alert('An error ocurred: ' + error.message + '(' + error.code + ')');
    return true;
}

function refreshEntries() {

    var currentDate = sessionStorage.currentDate;
    $('#date h1').text(currentDate);
    $('#date ul li:gt(0)').remove();
    db.transaction(
            function(transaction) {
                transaction.executeSql(
                        'SELECT * FROM entries WHERE date = ? ORDER BY food;',
                        [currentDate],
                        function(transaction, result) {
                            for (var k = 0; k < result.rows.length; k++) {

                                var row = result.rows.item(k);
                                var newEntryRow = $('#entryTemplate').clone();
                                newEntryRow.removeAttr('id');
                                newEntryRow.removeAttr('style');
                                newEntryRow.data('entryId', row.id);
                                newEntryRow.appendTo('#date ul');
                                newEntryRow.find('.label').text(row.food);
                                newEntryRow.find('.calories').text(row.calories);

                                newEntryRow.find('.delete').click(function(){
                                    
                                    var clickedEntry = $(this).parent();
                                    var clickedEntryId = clickedEntry.data('entryId');
                                    
                                    deleteEntryById( clickedEntryId );
                                    clickedEntry.slideUp();
                                    
                                });

                            }
                        },
                        errorHandler
                        );
            }
    );
}

function saveSettings() {

    localStorage.age = $('#age').val();
    localStorage.budget = $('#budget').val();
    localStorage.weight = $('#weight').val();
    jQT.goBack();
    return false;
}

function loadSettings() {

    $('#age').val(localStorage.age);
    $('#budget').val(localStorage.budget);
    $('#weight').val(localStorage.weight);

}

function deleteEntryById( id ){
    
    db.transaction(
        function( tx ){
            tx.executeSql('DELETE FROM entries WHERE id = ?;', [id], null, errorHandler );
        }
    );
    
}