var createStatement = "CREATE TABLE IF NOT EXISTS sesion (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT, rol TEXT, tipo_comision INTEGER, comision REAL, wp_auth_cookie TEXT)";
var selectAllStatement = "SELECT * FROM sesion";
var insertStatement = "INSERT INTO sesion (nombre, email, rol, tipo_comision, comision, wp_auth_cookie) VALUES (?, ?, ?, ?, ?, ?)";
var deleteStatement = "DELETE FROM sesion WHERE id = ?";
var dropStatement = "DROP TABLE IF EXISTS sesion";

var COMISION_FIJA = 1;
var COMISION_PORC = 2;

function initDatabase() {
    try {
        if (!window.openDatabase)
        {
            alert('SQLite no soportado.');
        }
        else {
            crearTablas();
        }
    } catch (e) {
        if (e == 2) {
            console.log("Invalid database version.");
        } else {
            console.log("Unknown error " + e + ".");
        }
    }
}

function crearTablas() {
    db.transaction(function (tx) {
        tx.executeSql(createStatement, [], null, onError);
    });
}

function insertUser(nombre, email, rol, tipo_comision, comision, wp_auth_cookie) {
    db.transaction(function (tx) {
        tx.executeSql(insertStatement, [nombre, email, rol, tipo_comision, comision, wp_auth_cookie], initUser, onError);
    });
}

function updateUser(nombre, email, rol, wp_auth_cookie) {
    db.transaction(function (tx) {
        tx.executeSql("UPDATE sesion SET nombre = ?, rol = ?, wp_auth_cookie = ? WHERE email = ?", [nombre, rol, wp_auth_cookie, email], initUser, onError);
    });
}

function updateComision(tipo_comision, comision) {
    db.transaction(function (tx) {
        tx.executeSql("UPDATE sesion SET tipo_comision = ?, comision = ? WHERE email = ?", [tipo_comision, comision, LoggedUser['email']], function (tx, result) {
            showPopup("#popup_options", 'Comisión actualizada con éxito');
        }, onError);
    });
}

function logoutUsers() {
    db.transaction(function (tx) {
        tx.executeSql("UPDATE sesion SET wp_auth_cookie = NULL", [], null, onError);
    });
}

function deleteRecord(id) {
    var iddelete = id.toString();

    db.transaction(function (tx) {
        tx.executeSql(deleteStatement, [id], showRecords, onError);
    });
}

function dropTable() {
    db.transaction(function (tx) {
        tx.executeSql(dropStatement, [], showRecords, onError);
    });
}

function onError(tx, error) {
    alert(error.message);
}

function loginUser(response) {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM sesion WHERE email = ?", [response.user.email], function (tx, result) {

            // This ajax call is to get user's meta, specifically his role
            $.ajax({
                url: 'https://autocauchos.com.ve/api-requests.php?action=user_role&cookie=' + response.cookie,
                type: 'GET',
                success: function(role){
                    dataset = result.rows;

                    if (dataset.length > 0) { // user exists, do not insert it, update cookie
                        updateUser(response.user.firstname, response.user.email, role, response.cookie);
                    } else { // new user logged in, insert it
                        insertUser(response.user.firstname, response.user.email, role, COMISION_PORC, 0, response.cookie);
                    }
                },
                error: function(status, error) {
                    showPopup('#popup_login', error);
                }
            });
        });
    });
}

function initUser() {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM sesion WHERE wp_auth_cookie IS NOT NULL", [], function (tx, result) {
            dataset = result.rows;

            if (dataset.length > 0) {
                LoggedUser = dataset.item(0);

                updateUI();

                $.mobile.navigate('#productos');
            }
        });
    });
}

function updateUI() {
    $('#logged_name').html(LoggedUser['nombre']);
    $('#comision').val(LoggedUser['comision']);

    if (LoggedUser['tipo_comision'] === COMISION_FIJA) {
        $('#radio-choice-monto').prop('checked', true);
        $('#radio-choice-porcentaje').prop('checked', false);
    } else {
        $('#radio-choice-porcentaje').prop('checked', true);
        $('#radio-choice-monto').prop('checked', false);
    }
}

function userExists(email) {
    var exists = false;

    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM sesion WHERE email = ?", [email], function (tx, result) {
            dataset = result.rows;

            if (dataset.length > 0) {
                exists = true;
            }
        });
    });

    return exists;
}

function showRecords() {
    return;

    db.transaction(function (tx) {
        tx.executeSql(selectAllStatement, [], function (tx, result) {
            dataset = result.rows;

            $('#listado').html('');
            for (var i = 0, item = null; i < dataset.length; i++) {
                item = dataset.item(i);

                $('#listado').append('<li><a href="#">'+ item['nombre'] + ' &lt;' + item['email'] + '&gt; ('+ item['precio'].toFixed(2) +')</a></li>');
            }

            $("#listado").listview("refresh");
        });
    });
}

$(document).ready(function () {
    db = openDatabase("autocauchos", "1.0", "autocauchos", 200000); // nombre, version, alias, tamaño estimado
    LoggedUser = null;

    initDatabase();
});