<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * This file defines all registration for the practice bird deeplink block
 */

function phonicscore_practicebird_deeplink_block_init() {
	$dir = __DIR__;

	$script_asset_path = "$dir/build/pbdeeplink_block.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` for the "phonicscore/opensheetmusicdisplay" block first.'
		);
	}
	$index_js     = 'build/pbdeeplink_block.js';
	$script_asset = require( $script_asset_path );
	//Use default dependencies, add deep link script as well
	if(array_key_exists('dependencies', $script_asset) && is_array($script_asset['dependencies'])){
		$script_asset['dependencies'][] = 'phonicscore_practicebird_deeplink_qrcode_library';
	}
	wp_register_script(
		'phonicscore_practicebird_deeplink_block_editor',
		plugins_url( $index_js, __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version']
	);
	wp_set_script_translations( 'phonicscore_practicebird_deeplink_block_editor', 'phonicscore_practicebird_deeplink' );

	$editor_css = 'build/styles/pbdeeplink_block.css';
	wp_register_style(
		'phonicscore_practicebird_deeplink_block_editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'build/styles/style-pbdeeplink_block.css';
	wp_register_style(
		'phonicscore_practicebird_deeplink_block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type(
		'phonicscore/practicebird-deeplink',
		array(
			'editor_script' => 'phonicscore_practicebird_deeplink_block_editor',
			'editor_style'  => 'phonicscore_practicebird_deeplink_block_editor',
			'style'         => 'phonicscore_practicebird_deeplink_block',
			'render_callback' => 'phonicscore_practicebird_deeplink_render_callback',
			'attributes' => array() //TODO: Attributes
		)
	);
}

function phonicscore_practicebird_deeplink_render_callback($block_attributes, $content){
	wp_enqueue_script(
		'phonicscore_practicebird_deeplink_frontend',
		esc_url( plugins_url( 'build/pbdeeplink_frontend.js', __FILE__ ) ),
		array( 'phonicscore_practicebird_deeplink_qrcode_library' ),
		'0.1.0',
		true
	);
	$className = '';
	$iconSize = '180px';
	if(is_array($block_attributes)){
		if(array_key_exists('className', $block_attributes)){
			$className = $block_attributes['className'];
		}
		if(array_key_exists('iconSize', $block_attributes)){
			$iconSize = $block_attributes['iconSize'] . "px";
		}
		if(!array_key_exists('generateBehavior', $block_attributes)){
			$block_attributes['generateBehavior'] = 0;
		}
	}

	$asJson = wp_json_encode($block_attributes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);
	return
		<<<EOT
		<div class="practicebird-deeplink__render-placeholder $className">
			<div class="practicebird-deeplink__qr-container"></div>
			<div class="practicebird-deeplink__mobile-container" style="width: $iconSize; height: $iconSize;"></div>
			<code style="display:none!important;" class="hidden">$asJson</code>
		</div>
EOT;
}

function phonicscore_practicebird_deeplink_enqueue_admin_scripts($hook){
    if ( 'post.php' != $hook && 'post-new.php' != $hook ) {
        return;
    }
	wp_enqueue_script(
		'phonicscore_practicebird_deeplink_qrcode_library',
		esc_url( plugins_url( 'build/pbdeeplink/qrcode.min.js', __FILE__ ) ),
		array( ),
		'0.1.0',
		true
	);

	wp_enqueue_style(
		'phonicscore_practicebird_deeplink_qrcode_library_css',
		esc_url( plugins_url( 'build/pbdeeplink/responsive_shim.min.css', __FILE__ ) ),
		array( ),
		'0.1.0'
	);
}

function phonicscore_practicebird_deeplink_enqueue_scripts($hook){
	wp_enqueue_script(
		'phonicscore_practicebird_deeplink_qrcode_library',
		esc_url( plugins_url( 'build/pbdeeplink/qrcode.min.js', __FILE__ ) ),
		array( ),
		'0.1.0',
		true
	);

	wp_enqueue_style(
		'phonicscore_practicebird_deeplink_qrcode_library_css',
		esc_url( plugins_url( 'build/pbdeeplink/responsive_shim.min.css', __FILE__ ) ),
		array( ),
		'0.1.0'
	);
}

function phonicscore_practicebird_deeplink_admin_notices() {
    ?>
    <div class="notice notice-info is-dismissible">
        <p><?php _e( '<strong>All new!</strong> The OpenSheetMusicDisplay plugin now includes a block for deeplinking musicXML into our PracticeBird app!', 'phonicscore_practicebird_deeplink' ); ?></p>
    </div>
    <?php
}

function phonicscore_practicebird_deeplink_activate_plugin(){
	//add_action( 'init', 'phonicscore_opensheetmusicdisplay_shortcode_init' );
	add_action( 'wp_enqueue_scripts', 'phonicscore_practicebird_deeplink_enqueue_scripts' );
	if(function_exists('register_block_type')){
        add_action( 'init', 'phonicscore_practicebird_deeplink_block_init' );
		add_action( 'admin_enqueue_scripts', 'phonicscore_practicebird_deeplink_enqueue_admin_scripts' );
		if (current_user_can('edit_posts') && is_admin()){
			$messageViewed = get_user_meta(get_current_user_id(), 'phonicscore_practicebird_deeplink_new_block_message_viewed', true);
			if($messageViewed === '' || $messageViewed == false){
				add_action( 'admin_notices', 'phonicscore_practicebird_deeplink_admin_notices' );
				update_user_meta(get_current_user_id(), 'phonicscore_practicebird_deeplink_new_block_message_viewed', true);
			}
		}
	}
}

add_action('plugins_loaded', 'phonicscore_practicebird_deeplink_activate_plugin', 11);
?>