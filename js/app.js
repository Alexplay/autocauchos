WC_CREDENTIALS = "consumer_key=ck_2f7f233b6b7067d261e4e95ea2e44451832838eb&consumer_secret=cs_e4333211a8afde42d143fdbfac5e7f33689bf63e";

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function refrescarTasaCambio() {
    $.get('https://autocauchos.com.ve/api-requests.php?action=get_veb_to_usd', function (response) {
        $('#veb_to_usd').val(response);
    });
}

function getCurrency() {
    return $('[name=radio-choice-b]:checked').val();
}

function getTasaCambio() {
    return $('#veb_to_usd').val();
}

function formatPrice(price) {
    var currency = LoggedUser['currency'] === 'VE' ? 'BsF. ' : 'US $';

    return currency + rawPrice(price);
}

function rawPrice(price) {
    if (LoggedUser['currency'] === 'US') {
        price /= getTasaCambio();
    }

    if (LoggedUser['tipo_comision'] === COMISION_FIJA) {
        price = parseFloat(LoggedUser['comision']) + parseFloat(price);
    } else {
        price *=  1 + LoggedUser['comision'] / 100;
    }

    return parseFloat(price).toFixed(2);
}

function showPopup(popupId, msg) {
    $(popupId + " p").html(msg);

    $(popupId).popup("open");
    setTimeout(function(){  $(popupId).popup("close"); }, 1000);
}

function getProductsAsText(html) {
    var lis = $('#listProductos').children('li').children('a').get();
    var productos = '';

    $.each(lis, function (k, obj) {
       var prod = $(obj).html().replace(/<small>/g, '').replace(/<\/small>/g, '');

       if ( html) {
           prod = prod.replace(/<br>/g, "\r\n");
       } else {
           prod = prod.replace(/<br>/g, "\n");
       }

       productos += prod + (html ? "\r\n\r\n" : "\n\n");
    });

    return productos;
}

function fillProductosTextarea() {
    var texto = getProductsAsText(false);
    texto = texto.replace(/<br>/g, "\r\n");

    $('#productos-texto textarea').html(texto);
}

function handleSocialShare()
{
    $('#sharepopup').on('click', 'a', function (ev) {
       ev.preventDefault();

       var tipo = $(this).data('share');

       switch (tipo) {
           default:
           case 'clipboard':
               $.mobile.navigate($(this).attr('href'));
               break;
           case 'whatsapp':
               var texto = getProductsAsText(false);

               shareWhatsApp(texto);
               break;
           /*case 'facebook':
               shareFacebookLike();
               break;*/
           case 'twitter':
               shareTwitter(getProductsAsText(false));
               break;
           case 'email':
               shareEmail(getProductsAsText(true));
               break;
       }
    });

    $('.select-all').on('click', function (ev) {
       ev.preventDefault();

       $('#productos-texto textarea').select();
    });
}

function shareWhatsApp(text) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var sText = "Text to share";

        var sMsg = encodeURIComponent(text);
        var whatsapp_url = "whatsapp://send?text=" + sMsg;

        window.location.href = whatsapp_url;
    } else {
        alert("Whatsapp client not available.");
    }
}

/*function shareFacebookLike(text)
{
    window.location = "http://www.facebook.com/sharer.php?s=100&p[title]=Listado de Precios AutoCauchos&p[summary]=" + text;
}*/

function shareTwitter(text)
{
    window.location = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
}

function shareEmail(text)
{
    window.location = "mailto:?subject=" + 'Listado de Precios AutoCauchos' + "&body=" + encodeURI(text);
}

function showAllProducts() {
    $.ajax({
        url: 'https://autocauchos.com.ve/wp-json/wc/v2/products?' + WC_CREDENTIALS + "&orderby=title&per_page=100",
        type: 'GET',
        cache: false,
        success: function (response) {
            var productos = '';

            for (var i = 0; i < response.length; i++) {
                var producto = response[i];

                var tags = [];
                for (var t = 0; t < producto.tags.length; t++) {
                    tags.push(producto.tags[t].name);
                }

                productos += '<li><a class="producto-item" href="#producto-detalles" data-images="'+producto.images[0].src+'" data-inventario="'+producto.stock_quantity+'" data-nombre="'+producto.name+'" data-precio="'+formatPrice(producto.price)+'" data-descripcion="'+htmlEncode(producto.description)+'" data-tags="'+tags.join()+'">'+producto.name+ '<br><small>' + formatPrice(producto.price) + '</small></a></li>';
            }

            /*
             {
             "id":315,
             "name":"Kumho",
             "slug":"kumho",
             "permalink":"https:\/\/autocauchos.com.ve\/producto\/kumho\/",
             "date_created":"2017-08-31T14:25:46",
             "date_created_gmt":"2017-08-31T14:25:46",
             "date_modified":"2017-09-01T06:10:31",
             "date_modified_gmt":"2017-09-01T06:10:31",
             "type":"simple",
             "status":"publish",
             "featured":false,
             "catalog_visibility":"visible",
             "description":"<p>prueba larga<\/p>\n",
             "short_description":"<p>prueba corta<\/p>\n",
             "sku":"",
             "price":"1847000",
             "regular_price":"1847000",
             "sale_price":"",
             "date_on_sale_from":null,
             "date_on_sale_from_gmt":null,
             "date_on_sale_to":null,
             "date_on_sale_to_gmt":null,
             "price_html":"<span class=\"woocommerce-Price-amount amount\"><span class=\"woocommerce-Price-currencySymbol\">Bs F<\/span>&nbsp;1.847.000,00<\/span>",
             "on_sale":false,
             "purchasable":true,
             "total_sales":2,
             "virtual":false,
             "downloadable":false,
             "downloads":[

             ],
             "download_limit":-1,
             "download_expiry":-1,
             "external_url":"",
             "button_text":"",
             "tax_status":"taxable",
             "tax_class":"",
             "manage_stock":true,
             "stock_quantity":8,
             "in_stock":true,
             "backorders":"no",
             "backorders_allowed":false,
             "backordered":false,
             "sold_individually":false,
             "weight":"",
             "dimensions":{
             "length":"",
             "width":"",
             "height":""
             },
             "shipping_required":true,
             "shipping_taxable":true,
             "shipping_class":"",
             "shipping_class_id":0,
             "reviews_allowed":false,
             "average_rating":"0.00",
             "rating_count":0,
             "related_ids":[
             77
             ],
             "upsell_ids":[

             ],
             "cross_sell_ids":[

             ],
             "parent_id":0,
             "purchase_note":"",
             "categories":[
             {
             "id":16,
             "name":"PIRELLI",
             "slug":"pirelli"
             }
             ],
             "tags":[
             {
             "id":26,
             "name":"Almacen 1",
             "slug":"almacen1"
             },
             {
             "id":20,
             "name":"Importado",
             "slug":"importado"
             },
             {
             "id":24,
             "name":"Nuevo",
             "slug":"nuevo"
             }
             ],
             "images":[
             {
             "id":314,
             "date_created":"2017-08-31T14:25:46",
             "date_created_gmt":"2017-08-31T14:25:46",
             "date_modified":"2017-08-31T14:25:46",
             "date_modified_gmt":"2017-08-31T14:25:46",
             "src":"https:\/\/autocauchos.com.ve\/wp-content\/uploads\/2017\/08\/caucho-1.jpg",
             "name":"",
             "alt":"",
             "position":0
             }
             ],
             "attributes":[

             ],
             "default_attributes":[

             ],
             "variations":[

             ],
             "grouped_products":[

             ],
             "menu_order":0,
             "meta_data":[
             {
             "id":2261,
             "key":"nm_members",
             "value":""
             },
             {
             "id":2296,
             "key":"_venezuela_regular_price",
             "value":"1847000"
             },
             {
             "id":2297,
             "key":"_venezuela_price",
             "value":"1847000"
             },
             {
             "id":2361,
             "key":"_venezuela_sale_price",
             "value":""
             },
             {
             "id":2362,
             "key":"_venezuela_price_method",
             "value":"exchange_rate"
             },
             {
             "id":2363,
             "key":"_venezuela_sale_price_dates",
             "value":"default"
             },
             {
             "id":2364,
             "key":"_venezuela_sale_price_dates_from",
             "value":""
             },
             {
             "id":2365,
             "key":"_venezuela_sale_price_dates_to",
             "value":""
             },
             {
             "id":2366,
             "key":"_woo_umf_enable",
             "value":"1"
             },
             {
             "id":2367,
             "key":"_et_pb_post_hide_nav",
             "value":"default"
             },
             {
             "id":2368,
             "key":"_et_pb_page_layout",
             "value":"et_right_sidebar"
             },
             {
             "id":2369,
             "key":"_et_pb_side_nav",
             "value":"off"
             },
             {
             "id":2370,
             "key":"_um_custom_access_settings",
             "value":"0"
             },
             {
             "id":2371,
             "key":"_um_accessible",
             "value":"0"
             },
             {
             "id":2372,
             "key":"_um_access_redirect2",
             "value":""
             },
             {
             "id":2373,
             "key":"_um_access_roles",
             "value":[
             "0"
             ]
             }
             */

            var list = $('#listProductos');

            list.html(productos);

            sortAZListview(list);

            fillProductosTextarea();
        }
    });
}

function showAllProductsWithFilter() {
    $.ajax({
        url: 'https://autocauchos.com.ve/wp-json/wc/v2/products?' + WC_CREDENTIALS + "&orderby=title&per_page=100",
        type: 'GET',
        cache: false,
        success: function (response) {
            var productos = '';


            // Filtros
            var minPrice = $('#range-2a').val();
            var maxPrice = $('#range-2b').val();
            var marcas = getCheckedMarcas();
            var etiquetas = getCheckedTags();

            for (var i = 0; i < response.length; i++) {
                var producto = response[i];
                var skip = false;

                var tags = [];
                var tags_slugs = [];
                for (var t = 0; t < producto.tags.length; t++) {
                    tags.push(producto.tags[t].name);
                    tags_slugs.push(producto.tags[t].slug);
                }

                var cats = [];
                for (t = 0; t < producto.categories.length; t++) {
                    cats.push(producto.categories[t].slug);
                }


                var precio = rawPrice(producto.price);

                if (parseFloat(precio) < parseFloat(minPrice) || parseFloat(precio) > parseFloat(maxPrice)) {
                    continue;
                }

                var exists = false;

                if (marcas.length > 0) {
                    $.each(marcas, function (k, v) {
                        if ($.inArray(v, cats) >= 0) {
                            exists = true;
                            return false;
                        }
                    });

                    if (!exists) {
                        continue;
                    }
                }

                if (etiquetas.length > 0) {
                    exists = false;
                    $.each(etiquetas, function (k, v) {
                        if ($.inArray(v, tags_slugs) >= 0) {
                            exists = true;
                            return false;
                        }
                    });

                    if (!exists) {
                        continue;
                    }
                }

                productos += '<li><a class="producto-item" href="#producto-detalles" data-images="'+producto.images[0].src+'" data-inventario="'+producto.stock_quantity+'" data-nombre="'+producto.name+'" data-precio="'+formatPrice(producto.price)+'" data-descripcion="'+htmlEncode(producto.description)+'" data-tags="'+tags.join()+'">'+producto.name+ '<br><small>' + formatPrice(producto.price) + '</small></a></li>';
            }

            var list = $('#listProductos');

            list.html(productos);

            sortAZListview(list);

            fillProductosTextarea();
        }
    });
}

function sortAZListview(list) {
    // read all list items (without list-dividers) into an array
    var lis = list.children('li').not( '.ui-li-divider' ).get();

    // sort the list items in the array
    lis.sort( function( a, b ) {
        var valA = $( a ).text(),
            valB = $( b ).text();
        if ( valA < valB ) { return -1; }
        if ( valA > valB ) { return 1; }
        return 0;
    });

    list.empty();

    $.each( lis, function( i, li ) {
        list.append( li );
    });


    list.listview("refresh");
}

function getCheckedMarcas() {
    var checkboxes = $('#marcas-container input:checked');
    var marcas = [];

    $.each(checkboxes, function (k, obj) {
        marcas.push($(obj).val());
    });

    return marcas;
}

function getCheckedTags() {
    var checkboxes = $('#tags-container input:checked');
    var marcas = [];

    $.each(checkboxes, function (k, obj) {
        marcas.push($(obj).val());
    });

    return marcas;
}

function createProductFilters() {
    $.get('https://autocauchos.com.ve/wp-json/wc/v2/products/categories?' + WC_CREDENTIALS + '&orderby=name', function (response) {
        var content = '';

        for (var i = 0; i < response.length; i++) {
            var marca = response[i];

            content +=  '<input type="checkbox" class="checkbox-marcas" name="checkbox-marca-'+marca.slug+'" id="checkbox-marca-'+marca.slug+'" value="'+marca.slug+'">' +
                        '<label for="checkbox-marca-'+marca.slug+'">'+marca.name+'</label>';
        }

        $('#marcas-container').html(content);
    });

    $.get('https://autocauchos.com.ve/wp-json/wc/v2/products/tags?' + WC_CREDENTIALS + '&orderby=name', function (response) {
        var content = '';

        for (var i = 0; i < response.length; i++) {
            var tag = response[i];

            content +=  '<input type="checkbox" class="checkbox-tags" name="checkbox-tag-'+tag.slug+'" id="checkbox-tag-'+tag.slug+'" value="'+tag.slug+'">' +
                        '<label for="checkbox-tag-'+tag.slug+'">'+tag.name+'</label>';
        }

        $('#tags-container').html(content);
    });
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

                    //showAllProducts();
                    createProductFilters();
                    refrescarTasaCambio();
                    handleSocialShare();
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

        var comision = $('[name=comision]').val().trim();

        if (comision === '') {
            comision = 0;
        }

        updateComision(parseInt($('[name=tipo_comision]:checked').val()), comision)
    });

    $('#form_tasa_cambio').on('submit', function (ev) {
        ev.preventDefault();

        /*$.ajax({
            url: 'https://autocauchos.com.ve/wp-admin/admin.php?page=wc-settings&tab=price-based-country&section=zones&edit_region=venezuela',
            type: 'POST',
            headers: {
                'Cookie':'wordpress_sec_3e6d4a45d8c780f713517ecd01b3cff2=' + encodeURI(LoggedUser['wp_auth_cookie']) + ';wordpress_logged_in_3e6d4a45d8c780f713517ecd01b3cff2=' + encodeURI(LoggedUser['wp_auth_cookie'])
            },
            data: {
                name: 'Bolívar venezolano (BsF)',
                countries: ['VE'],
                currency: 'VEF',
                exchange_rate: $('#veb_to_usd').val(),
                page: 'wc-settings',
                tab: 'wc_price_based_country',
                section: 'zones',
                edit_region: 'venezuela',
                _wpnonce: '820143cf28'
            },
            success: function (response) {
                showPopup("#popup_options", 'Se actualizó con éxito');

                refrescarTasaCambio();
                showAllProducts();
            },
            error: function (response) {
                showPopup("#popup_options", 'No se pudo actualizar, inténtelo de nuevo');
            }
        });*/

        $.get($(this).attr('action'), $(this).serialize(), function (response) {
            var msg = response === 'success' ? 'Se actualizó con éxito' : 'Actualización fallida, inténtelo de nuevo';

            showPopup("#popup_options", msg);

            refrescarTasaCambio();
            showAllProducts();
        });

        /*$.get($(this).attr('action'), {
            action: 'set_veb_to_usd',
            rate: $('#veb_to_usd').val(),
            cookie: LoggedUser['wp_auth_cookie']
        }, function (response) {
            var msg = response === 'success' ? 'Se actualizó con éxito' : 'Actualización fallida, inténtelo de nuevo';

            showPopup("#popup_options", msg);

            refrescarTasaCambio();
            showAllProducts();
        });*/
    });

    $('#radio-choice-c, #radio-choice-d').on('change', function () {
        updateCurrency(getCurrency());
    });

    $('#filtrar-form').on('submit', function (ev) {
       ev.preventDefault();

       showAllProductsWithFilter();
    });

    $('#mostrar-todos-productos').on('click', function (ev) {
       ev.preventDefault();

       showAllProducts();
    });

    $('#listProductos').on('click', 'a', function (ev) {
        $('#producto-detalles h1').html($(this).data('nombre'));
        $('#producto-detalles img').attr('src', $(this).data('images'));
        $('#producto-detalles .item-precio').html($(this).data('precio'));
        $('#producto-detalles .item-inventario').html($(this).data('inventario'));
        $('#producto-detalles .item-tags').html($(this).data('tags'));
        $('#producto-detalles .item-descripcion').html(htmlDecode($(this).data('descripcion')));
    })
});