<?php
header("Access-Control-Allow-Origin: *");
/**
 * Este archivo es para ser utilizado para peticiones sencillas a la base de datos de wordpress a traves de la app movil.
 *
 */
define('DB_NAME', 'autocauc_wp515');
define('DB_USER', 'autocauc_wp515');
define('DB_PASSWORD', '60(pSIV4n!');

$db = new  mysqli("localhost", DB_USER, DB_PASSWORD, DB_NAME);
$db->set_charset("utf8");
$response = null;

function requestJson($url) {
    return json_decode(requestHelper($url));
}

function requestHelper($url, $post = false) {
    $ch = curl_init();
    curl_setopt_array($ch, array(
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_TIMEOUT_MS => 0,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_URL => $url,
            CURLOPT_POST => $post
        )
    );
    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}


switch ($_GET['action']) {
    case 'set_veb_to_usd':
        $rate = $_GET['rate'];
        $cookie = urlencode($_GET['cookie']);
        /*$rate = $_GET['rate'];

        $result = $db->query( "SELECT * FROM wp7n_options WHERE option_name = 'wc_price_based_country_regions'")->fetch_object();
        $values = unserialize($result->option_value);
        $values['venezuela']['exchange_rate'] = $rate;

        $values = serialize($values);

        $db->query("UPDATE wp7n_options SET option_value = '$values' WHERE option_name = 'wc_price_based_country_regions'");*/

        $ch = curl_init();
        curl_setopt_array($ch, array(
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_TIMEOUT_MS => 0,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_URL => 'https://autocauchos.com.ve/wp-admin/admin.php?page=wc-settings&tab=price-based-country&section=zones&edit_region=venezuela',
                CURLOPT_HTTPHEADER => [
                    "Cookie:wordpress_sec_3e6d4a45d8c780f713517ecd01b3cff2=$cookie;wordpress_logged_in_3e6d4a45d8c780f713517ecd01b3cff2=$cookie"
                ],
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => [
                    'name' => 'Bolívar venezolano (BsF)',
                    'countries' => ['VE'],
                    'currency' => 'VEF',
                    'exchange_rate' => $rate,
                    'page' => 'wc-settings',
                    'tab' => 'wc_price_based_country',
                    'section' => 'zones',
                    'edit_region' => 'venezuela',
                    '_wpnonce' => '820143cf28'
                ]
            )
        );
        $result = curl_exec($ch);
        curl_close($ch);

        $response = 'success';

        break;
    case 'get_veb_to_usd':
        $result = $db->query( "SELECT * FROM wp7n_options WHERE option_name = 'wc_price_based_country_regions'")->fetch_object();
        /*
          Array (
              [venezuela] => Array (
                  [name] => Bolívar venezolano (BsF)
                  [countries] => Array ( [0] => VE )
                  [currency] => VEF
                  [exchange_rate] => 16840
              )
          )
         */
        $values = unserialize($result->option_value);

        $response = $values['venezuela']['exchange_rate'];

        break;
    case 'login_user':
        $username = $_GET['username'];
        $password = $_GET['password'];

        $response = requestHelper("https://autocauchos.com.ve/api/user/generate_auth_cookie/?username=$username&password=$password");

        break;
    case 'user_role':
        $cookie = $_GET['cookie'];

        $response = requestHelper("https://autocauchos.com.ve/api/user/get_user_meta/?cookie=$cookie");

        $role = unserialize(json_decode($response)->wp7n_capabilities);
        $role = isset($role['administrator']) && $role['administrator'] == 1 ? 'admin' : 'user';

        $response = $role;

        break;
}

$db->close();

echo $response;