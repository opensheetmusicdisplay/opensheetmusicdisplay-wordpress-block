<?php
/**
 * Plugin Name:     OpenSheetMusicDisplay
 * Description:     Block to render MusicXML in the browser as sheet music using OSMD.
 * Version:         0.1.0
 * Author:          opensheetmusicdisplay, fredmeister77
 * License:         GPL-2.0-or-later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     opensheetmusicdisplay
 *
 * @package         phonicscore
 */

/**
 * Registers all block assets so that they can be enqueued through the block editor
 * in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 */
function phonicscore_opensheetmusicdisplay_block_init() {
	$dir = __DIR__;

	$script_asset_path = "$dir/build/index.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` for the "phonicscore/opensheetmusicdisplay" block first.'
		);
	}
	$index_js     = 'build/index.js';
	$script_asset = require( $script_asset_path );
	//Use default dependencies, add OSMD as one
	if(array_key_exists('dependencies', $script_asset) && is_array($script_asset['dependencies'])){
		$script_asset['dependencies'][] = 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist';
	}
	wp_register_script(
		'phonicscore-opensheetmusicdisplay-block-editor',
		plugins_url( $index_js, __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version']
	);
	wp_set_script_translations( 'phonicscore-opensheetmusicdisplay-block-editor', 'opensheetmusicdisplay' );

	$editor_css = 'build/index.css';
	wp_register_style(
		'phonicscore-opensheetmusicdisplay-block-editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'build/style-index.css';
	wp_register_style(
		'phonicscore-opensheetmusicdisplay-block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type(
		'phonicscore/opensheetmusicdisplay',
		array(
			'editor_script' => 'phonicscore-opensheetmusicdisplay-block-editor',
			'editor_style'  => 'phonicscore-opensheetmusicdisplay-block-editor',
			'style'         => 'phonicscore-opensheetmusicdisplay-block',
		)
	);
}


function phonicscore_opensheetmusicdisplay_enqueue_scripts(){
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'0.9.2',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_frontend_script',
		esc_url( plugins_url( 'build/osmd/osmd-loader.min.js', __FILE__ ) ),
		array( 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist' ),
		'0.1.0',
		true
	);
}
function phonicscore_opensheetmusicdisplay_enqueue_admin_scripts(){
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'0.9.2',
		true
	);
}
function phonicscore_opensheetmusicdisplay_musicxml_mime_types( $mimes ) {
	$mimes['musicxml'] = 'application/vnd.recordare.musicxml+xml';
	$mimes['mxl'] = 'application/vnd.recordare.musicxml';
	$mimes['xml'] = 'text/xml|application/xml';
	return $mimes;
}
add_filter( 'upload_mimes', 'phonicscore_opensheetmusicdisplay_musicxml_mime_types', 98 );

include_once 'MultipleMimes.php';
MultipleMimes::init();

function phonicscore_opensheetmusicdisplay_activate_plugin(){
	add_action( 'init', 'phonicscore_opensheetmusicdisplay_block_init' );
	add_action( 'wp_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_scripts' );
	add_action( 'admin_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_admin_scripts' );
}

add_action('plugins_loaded', 'phonicscore_opensheetmusicdisplay_activate_plugin', 10);