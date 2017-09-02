function refrescarTasaCambio() {
    $.get('https://autocauchos.com.ve/api-requests.php?action=get_veb_to_usd', function (response) {
        $('#veb_to_usd').val(response);
    });
}

function showPopup(popupId, msg) {
    $(popupId + " p").html(msg);

    $(popupId).popup("open");
    setTimeout(function(){  $(popupId).popup("close"); }, 1000);
}

$(document).ready(function () {
    $( document ).on( "pagecreate", function() {
        $( "body > [data-role='panel']" ).panel();
        $( "body > [data-role='panel'] [data-role='listview']" ).listview();
    });

    $('.copyright').html(new Date().getFullYear());

    $('#logout').on('click', function (ev) {
       ev.preventDefault();

       logoutUsers();

       $.mobile.navigate($(this).attr('href'));
    });

    $('#login_form').on('submit', function (ev) {
        ev.preventDefault();

        var username = $('#login_username').val();
        var password = $('#login_password').val();

        $.ajax({
            url: 'https://autocauchos.com.ve/api-requests.php?action=login_user&username=' + username + '&password=' + password,
            type: 'GET',
            success: function(response){
                response = JSON.parse(response);

                logoutUsers();

                if (response.status === 'error') {
                    showPopup('#popup_login', 'Usuario o Contraseña inválidos');
                } else if (response.status === 'ok') {
                    loginUser(response);

                    refrescarTasaCambio();
                } else {
                    showPopup('#popup_login', 'No se pudo establecer una conexión con el servidor');
                }
            },
            error: function(status, error) {
                showPopup('#popup_login', error);
            }
        });
    });

    $('#form_comision').on('submit', function (ev) {
        ev.preventDefault();

        updateComision(parseInt($('[name=tipo_comision]:checked').val()), $('[name=comision]').val())
    });

    $('#form_tasa_cambio').on('submit', function (ev) {
        $.get($(this).attr('action'), $(this).serialize(), function (response) {
            var msg = response === 'success' ? 'Se actualizó con éxito' : 'Actualización fallida, inténtelo de nuevo';

            showPopup("#popup_options", msg);
            /*$("#popup_options p").html(msg);

            $("#popup_options").popup("open");
            setTimeout(function(){  $("#popup_options").popup("close"); }, 1000);*/

            refrescarTasaCambio();
        });
    });

    $('#filtrar-form').on('submit', function (ev) {
       ev.preventDefault();

       // TODO: Update products (reload with new parameters)
    });




    /*$.get('https://autocauchos.com.ve/wp-json/wc/v2/products?consumer_key=ck_2f7f233b6b7067d261e4e95ea2e44451832838eb&consumer_secret=cs_e4333211a8afde42d143fdbfac5e7f33689bf63e', function (response) {
        console.log(response);
    });*/

    // https://autocauchos.com.ve/api/user/generate_auth_cookie/?username=Angel&password=102938
});