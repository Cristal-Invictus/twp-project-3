# Endpoint d'inscription WordPress (custom-auth/v1/register)

## 1. Emplacement du fichier
Créer le dossier s'il n'existe pas:
```
wp-content/mu-plugins/
```
Dans ce dossier, ajouter le fichier: `custom-auth-register.php`

## 2. Contenu du fichier `custom-auth-register.php` (version renforcée)
```php
<?php
/**
 * Plugin Name: Custom Auth Register Endpoint
 * Description: Endpoint public pour créer un compte contributor + retourner un JWT (avec protections basiques: rate limit, honeypot, politique mot de passe).
 */

if ( ! defined( 'WPINC' ) ) { die; }

add_action('rest_api_init', function(){
  register_rest_route('custom-auth/v1','/register', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'callback' => function( WP_REST_Request $req ){
      $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
      $rate_key = 'car_reg_' . md5($ip);
      $attempts = (int) get_transient($rate_key);
      if($attempts > 20){
        return new WP_Error('rate_limited','Too many attempts',[ 'status'=>429 ]);
      }
      set_transient($rate_key, $attempts + 1, 10 * MINUTE_IN_SECONDS);

      $username = sanitize_user($req->get_param('username'));
      $email    = sanitize_email($req->get_param('email'));
      $password = (string) $req->get_param('password');
      $website  = trim((string)$req->get_param('website'));
      // Honeypot: si rempli -> spam
      if(!empty($website)){
        return new WP_Error('spam_detected','Spam detected',[ 'status'=>400 ]);
      }

      if( empty($username) || empty($email) || empty($password) ){
        return new WP_Error('register_missing_fields','Missing fields',[ 'status'=>400 ]);
      }
      if( username_exists($username) || email_exists($email) ){
        return new WP_Error('register_user_exists','User already exists',[ 'status'=>409 ]);
      }
      if( ! get_option('users_can_register') ){
        return new WP_Error('register_closed','Registration disabled',[ 'status'=>403 ]);
      }

      // Politique mot de passe: >=10 chars, minuscule, majuscule, chiffre
      $policy_errors = [];
      if(strlen($password) < 10) $policy_errors[] = 'len';
      if(!preg_match('/[a-z]/',$password)) $policy_errors[] = 'lower';
      if(!preg_match('/[A-Z]/',$password)) $policy_errors[] = 'upper';
      if(!preg_match('/\d/',$password))   $policy_errors[] = 'digit';
      $blacklist = ['password','123456','azerty','qwerty','admin','welcome'];
      if(in_array(strtolower($password), $blacklist, true)) $policy_errors[] = 'common';
      if($policy_errors){
        return new WP_Error('weak_password','Weak password',[ 'status'=>400, 'details'=>$policy_errors ]);
      }

      $user_id = wp_create_user($username, $password, $email);
      if( is_wp_error($user_id) ){
        return new WP_Error('register_failed',$user_id->get_error_message(),[ 'status'=>500 ]);
      }

      $user = get_user_by('id',$user_id); $user->set_role('contributor');

      if( ! defined('JWT_AUTH_SECRET_KEY') ){
        return new WP_Error('jwt_missing_key','JWT secret missing',[ 'status'=>500 ]);
      }

      $issuedAt = time();
      $expire   = $issuedAt + ( DAY_IN_SECONDS * 7 );
      $payload = [
        'iss'  => get_bloginfo('url'),
        'iat'  => $issuedAt,
        'nbf'  => $issuedAt,
        'exp'  => $expire,
        'data' => [ 'user'=> [ 'id'=>$user_id ] ]
      ];

      if( class_exists('Tmeister\\Firebase\\JWT\\JWT') ){
        $token = Tmeister\Firebase\JWT\JWT::encode($payload, JWT_AUTH_SECRET_KEY, 'HS256');
      } else {
        return new WP_Error('jwt_class_missing','JWT class missing',[ 'status'=>500 ]);
      }

      return [
        'token'             => $token,
        'user_email'        => $user->user_email,
        'user_nicename'     => $user->user_nicename,
        'user_display_name' => $user->display_name,
      ];
    }
  ] );
});
```

## 3. Activer l'inscription WP (si nécessaire)
Dans l'admin: Réglages > Général > cocher "Tout le monde peut s'enregistrer".
Ou via WP-CLI:
```
wp option update users_can_register 1
```

## 4. Tester l'endpoint
```
curl -X POST http://localhost:10003/wp-json/custom-auth/v1/register \
  -d "username=testu1&email=testu1@example.com&password=pass123"
```
Réponse attendue: JSON avec `token`.

## 5. Front-end
`authService.register` appelle désormais `/custom-auth/v1/register` et si la réponse contient un token l'utilisateur est auto-connecté.

## 6. Sécurité implémentée
- Rate limit simple: 20 tentatives / 10 minutes par IP.
- Honeypot: champ `website` doit rester vide.
- Politique mot de passe: longueur ≥10 + minuscule + majuscule + chiffre + blacklist.

## 6.1 Idées d'amélioration future
- Ajouter reCAPTCHA ou hCaptcha.
- Validation email (lien d’activation) et rôle temporaire.
- Liste de révocation JWT.

## 7. Révocation / logout
Le logout côté front supprime juste le token; côté serveur JWT n'est pas invalidé avant expiration. Pour invalider prématurément il faudrait maintenir une liste de révocation (non implémenté).

---
Fin.
