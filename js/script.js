var App = function() {
	this.BASE_URL = '';
	this.CLIENT_KEY = 'ck_2f7f233b6b7067d261e4e95ea2e44451832838eb';
	this.CLIENT_KEY_SECRET = 'cs_e4333211a8afde42d143fdbfac5e7f33689bf63e';

	var inicio = '#inicio';
	var presupuestos = '#presupuestos';
	var navbar = '.navbar';
	
	var comp_creacion = 'componentes/creacion.html';
	var comp_presupuestos = 'componentes/presupuestos.html';
	var comp_menu = 'componentes/menu.html';

	var checkboxes;
	
	var refresh = function() {
		$('[data-role="page"]').trigger('create');
	};
	
	var initComponente = function(selector, componente, callback) {
		$(selector).load(componente, callback);
	};
	
	var initNavegacion = function() {
		initComponente(navbar, comp_menu, function() {			
			refresh();
		});
	};
	
	this.refreshNavegacion = function() {
		var pagina = $(':mobile-pagecontainer').pagecontainer( 'getActivePage' ).attr( 'id' );
		
		$('[data-role="navbar"] a').removeClass('ui-btn-active');
		$('a[href="#'+pagina+'"]').addClass('ui-btn-active');
	};
	
	this.init = function() {
		initPrecios();

		initComponente(inicio, comp_creacion, function() {			
			initNavegacion();
			
			$('fieldset#complejidad input').on('click', function() {
				$('small#complejidad-descripción').html($(this).attr('data-descripcion'));
			});

			initControles();
			showRecords();
		});
		
		initComponente(presupuestos, comp_presupuestos, function() {
			initNavegacion();
		});
	};

	var initPrecios = function () {
		$.get('http://adevelca.com/obtener-precios', function (data) {
			checkboxes = JSON.parse(data);
		});
	};

	var calcular = function () {
		var suma = 0;

		suma += $('#slider-paginas').val() * 5000;
		suma += $('#slider-temas').val() * 2500;
		suma += $('#slider-email').val() * 500;

		var complejidad = {
			personal: 20000,
			standard: 30000,
			avanzado: 40000,
			deluxe: 50000,
			profesional: 60000,
			empresarial: 70000
		};

		suma += complejidad[ $('input[name=check-complejidad]:checked').val() ];

		/*var checkboxes = {
			opciones: {
				logo: 5000,
				archivo: 2500,
				busqueda: 3000,
				rss: 3500,
				movil: 1250
			},
			social: {
				facebook: 1000,
				twitter: 2000,
				blog: 1200,
				youtube: 1300,
				otro: 500
			},
			fotos: {
				galeria: 15000,
				slider: 10000,
				gestion: 25000,
				flickr: 5000,
				otro: 500
			},
			modulos: {
				login: 10000,
				perfil: 10000,
				productos: 15000,
				cms: 30000,
				comentarios: 2000
			},
			monetizacion: {
				donaciones: 6000,
				basico: 10000,
				intermedio: 15000,
				avanzado: 20000,
				descargable: 20000
			},
			servicios: {
				hosting: 4000,
				dominio: 1500,
				email: 3000,
				publicidad: 5000,
				correos: 12000
			}
		};*/

		$.each(checkboxes, function (i, valor) {
			$.each( $('input[name=check-' + i + ']:checked'), function (j, obj) {
				suma += checkboxes[i][ $(obj).val() ];
			});
		});

		$('#total').val(suma.toFixed(2));
	};

	var initControles = function () {
		$(document).on('change', 'input[name=slider-paginas]', function() {
			calcular();
		});

		$(document).on('change', 'input[name=slider-temas]', function() {
			calcular();
		});

		$(document).on('change', 'input[name=slider-email]', function() {
			calcular();
		});

		$('input[name=check-complejidad]').on('change', function () {
			calcular();
		});

		$('input[name=check-opciones]').on('change', function () {
			calcular();
		});

		$('input[name=check-social]').on('change', function () {
			calcular();
		});

		$('input[name=check-fotos]').on('change', function () {
			calcular();
		});

		$('input[name=check-modulos]').on('change', function () {
			calcular();
		});

		$('input[name=check-monetizacion]').on('change', function () {
			calcular();
		});

		$('input[name=check-servicios]').on('change', function () {
			calcular();
		});

		$('form').on('submit', function(ev) {
			ev.preventDefault();

			$.post('http://adevelca.com/enviar-correo', {email: $('#email-enviar').val(), nombre: $('#presupuesto-guardar').val(), monto: $('#total').val()}, function() {
				$('#mensaje-envio').show();

				insertRecord($('#presupuesto-guardar').val(), $('#email-enviar').val(), parseFloat($('#total').val()));
				showRecords();
				refresh();
			});
		});
	};
};

$(document).on('pagebeforeshow', function() {	
	var app = new App();
	app.init();
});

$(document).on('pagechange', function() {
	var app = new App();
	app.refreshNavegacion();
});