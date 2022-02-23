<?php
/**
 * Plugin Name:     OpenSheetMusicDisplay
 * Description:     Block (and shortcode) to render MusicXML in the browser as sheet music using OSMD.
 * Version:         1.1.8
 * Author:          opensheetmusicdisplay.org
 * Author URI:		https://opensheetmusicdisplay.org
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
 * @see https://developer.wordpress.org/block_editor/tutorials/block_tutorial/applying_styles_with_stylesheets/
 */
include_once 'settings.php';

define("phonicscore_opensheetmusicdisplay_processed_attributes", phonicscore_opensheetmusicdisplay_get_attributes_list());

function phonicscore_opensheetmusicdisplay_generate_client_attributes(){
	$jsonDefaults = wp_json_encode(phonicscore_opensheetmusicdisplay_processed_attributes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);
	return <<<EOT
	(function(){
		const atts = ${jsonDefaults};
		console.log(atts);
		function registerAttributes(settings, name){
			if( name === 'phonicscore/opensheetmusicdisplay'){
				const keys = Object.keys(atts);
				for(let i = 0; i < keys.length; i++){
					settings.attributes[keys[i]] = atts[keys[i]];
				}
			}
			return settings;
		}
		wp.hooks.addFilter(
			'blocks.registerBlockType',
			'phonicscore/opensheetmusicdisplay/block-type-hook',
			registerAttributes
		);
	})();
	EOT;
}


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
		$script_asset['dependencies'][] = 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports';
		$script_asset['dependencies'][] = 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist';
		$script_asset['dependencies'][] = 'fredmeister77_queueable_attributes_dist';
	}
	wp_register_script(
		'phonicscore_opensheetmusicdisplay_block_editor',
		plugins_url( $index_js, __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version']
	);
	wp_set_script_translations( 'phonicscore_opensheetmusicdisplay_block_editor', 'opensheetmusicdisplay' );

	$editor_css = 'build/index.css';
	wp_register_style(
		'phonicscore_opensheetmusicdisplay_block_editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'build/style-index.css';
	wp_register_style(
		'phonicscore_opensheetmusicdisplay_block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type(
		'phonicscore/opensheetmusicdisplay',
		array(
			'editor_script' => 'phonicscore_opensheetmusicdisplay_block_editor',
			'editor_style'  => 'phonicscore_opensheetmusicdisplay_block_editor',
			'style'         => 'phonicscore_opensheetmusicdisplay_block',
			'render_callback' => 'phonicscore_opensheetmusicdisplay_render_callback',
			'attributes' => phonicscore_opensheetmusicdisplay_processed_attributes
		)
	);
}

function phonicscore_opensheetmusicdisplay_get_attributes_list() {
	$attributes = array(
		'alignRests' => array(
			'type' => 'number',
			'default' => 0
		),
		'autoBeam' => array(
			'type' => 'boolean',
			'default' => false
		),
		'autoBeamOptions' => array(
			'type' => 'object',
			'default' => array(
				'beam_middle_rests_only' => false,
				'beam_rests' => false,
				'maintain_stem_directions' => false
			)
		),
		'autoResize' => array(
			'type' => 'boolean',
			'default' => true
		),
		'backend' => array(
			'type' => 'string',
			'default' => 'svg'
		),
		'coloringMode' => array(
			'type' => 'number',
			'default' => null
		),
		'coloringSetCustom' => array(
			'type' => 'array',
			'default' => null
		),
		'coloringEnabled' => array(
			'type' => 'boolean',
			'default' => true
		),
		'colorStemsLikeNoteheads' => array(
			'type' => 'boolean',
			'default' => false
		),
		'defaultColorNotehead' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultColorStem' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultColorRest' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultColorLabel' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultColorTitle' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultFontFamily' => array(
			'type' => 'string',
			'default' => null
		),
		'defaultFontStyle' => array(
			'type' => 'number',
			'default' => 0
		),
		'disableCursor' => array(
			'type' => 'boolean',
			'default' => true
		),
		'followCursor' => array(
			'type' => 'boolean',
			'default' => false
		),
		'drawingParameters' => array(
			'type' => 'string',
			'default' => null
		),
		'drawCredits' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawTitle' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawSubtitle' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawComposer' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawLyricist' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawMetronomeMarks' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawPartNames' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawPartAbbreviations' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawMeasureNumbers' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawMeasureNumbersOnlyAtSystemStart' => array(
			'type' => 'boolean',
			'default' => false
		),
		'drawTimeSignatures' => array(
			'type' => 'boolean',
			'default' => true
		),
		'measureNumberInterval' => array(
			'type' => 'number',
			'default' => 2
		),
		'useXMLMeasureNumbers' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawFingerings' => array(
			'type' => 'boolean',
			'default' => true
		),
		'fingeringPosition' => array(
			'type' => 'string',
			'default' => null
		),
		'fingeringInsideStafflines' => array(
			'type' => 'boolean',
			'default' => false
		),
		'drawLyrics' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawSlurs' => array(
			'type' => 'boolean',
			'default' => true
		),
		'drawUpToMeasureNumber' => array(
			'type' => 'number',
			'default' => null
		),
		'drawUpToSystemNumber' => array(
			'type' => 'number',
			'default' => null
		),
		'drawUpToPageNumber' => array(
			'type' => 'number',
			'default' => null
		),
		'drawFromMeasureNumber' => array(
			'type' => 'number',
			'default' => null
		),
		'fillEmptyMeasuresWithWholeRest' => array(
			'type' => 'number',
			'default' => 0
		),
		'setWantedStemDirectionByXml' => array(
			'type' => 'boolean',
			'default' => true
		),
		'tupletsRatioed' => array(
			'type' => 'boolean',
			'default' => false
		),
		'tupletsBracketed' => array(
			'type' => 'boolean',
			'default' => false
		),
		'tripletsBracketed' => array(
			'type' => 'boolean',
			'default' => false
		),
		'pageFormat' => array(
			'type' => 'string',
			'default' => null
		),
		'pageBackgroundColor' => array(
			'type' => 'string',
			'default' => null
		),
		'renderSingleHorizontalStaffline' => array(
			'type' => 'boolean',
			'default' => false
		),
		'newSystemFromXML' => array(
			'type' => 'boolean',
			'default' => false
		),
		'newPageFromXML' => array(
			'type' => 'boolean',
			'default' => false
		),
		'percussionOneLineCutoff' => array(
			'type' => 'number',
			'default' => 4
		),
		'percussionForceVoicesOneLineCutoff' => array(
			'type' => 'number',
			'default' => 3
		),
		'spacingFactorSoftmax' => array(
			'type' => 'number',
			'default' => 5
		),
		'spacingBetweenTextLines' => array(
			'type' => 'number',
			'default' => null
		),
		'stretchLastSystemLine' => array(
			'type' => 'boolean',
			'default' => false
		),
		'autoGenerateMutipleRestMeasuresFromRestMeasures' => array(
			'type' => 'boolean',
			'default' => true
		),
		'width' => array(
			'type' => 'number',
			'default' => 100.0
		),
		'aspectRatio' => array(
			'type' => 'number',
			'default' => 0.0
		),
		'zoom' => array(
			'type' => 'number',
			'default' => 1.0
		),
		'musicXmlId' =>array(
			'type' => 'number',
			'default' => -1
		),
		'musicXmlUrl' => array(
			'type' => 'string',
			'default' => null
		),
		'musicXmlTitle' => array(
			'type' => 'string',
			'default' => null
		)
	);
	$attributes = apply_filters('phonicscore/opensheetmusicdisplay/block-attributes', $attributes);
	$phonicscore_opensheetmusicdisplay_default_settings_options = get_option( 'phonicscore_opensheetmusicdisplay_default_settings_option_name' ); // Array of All Options
	
	foreach($attributes as $key => $value){
		switch($value['type']){
			case 'boolean':
				$newValue = is_array($phonicscore_opensheetmusicdisplay_default_settings_options) && 
							array_key_exists($key, $phonicscore_opensheetmusicdisplay_default_settings_options) &&
							$phonicscore_opensheetmusicdisplay_default_settings_options[$key] === $key;
				$attributes[$key]['default'] = $newValue;
			break;
			default:
				if(is_array($phonicscore_opensheetmusicdisplay_default_settings_options) && 
				array_key_exists($key, $phonicscore_opensheetmusicdisplay_default_settings_options)){
					$attributes[$key]['default'] = $phonicscore_opensheetmusicdisplay_default_settings_options[$key];
				}
			break;
		}
	}
	return $attributes;
}

function phonicscore_opensheetmusicdisplay_render_callback($block_attributes, $content){
	$asJson = wp_json_encode($block_attributes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);
	$width = '100%';
	$className = '';
	if(is_array($block_attributes)){
		if(array_key_exists('width', $block_attributes)){
			$width = $block_attributes['width'] . '%';
		}
		if(array_key_exists('className', $block_attributes)){
			$className = $block_attributes['className'];
		}
	}
	return
		<<<EOT
		<div class="phonicscore-opensheetmusicdisplay__placeholder $className" style="width: $width !important; max-width: $width !important;">
			<div class="phonicscore-opensheetmusicdisplay__loading-spinner hide"></div>
			<div class="phonicscore-opensheetmusicdisplay__render-block" style="width: $width !important; max-width: $width !important;"></div>
			<code style="display:none;" class="attributesAsJson">$asJson</code>
		</div>
EOT;
}

function phonicscore_opensheetmusicdisplay_shortcode_callback($shortCodeAtts, $content, $name) {
	$availableAtts = phonicscore_opensheetmusicdisplay_get_attributes_list();
	foreach ($availableAtts as $key => $value) {
		//Shortcode have their atts automatically lower cased. We can't do that though because of omsd option names.
		//Find them in the shortcode atts and adapt them before passing to render function.
		$keyLowerCase = strtolower($key);
		if(array_key_exists($keyLowerCase, $shortCodeAtts) ) {
			switch ($value['type']) {
				case 'number':
					$shortCodeAtts[$key] = floatval($shortCodeAtts[$keyLowerCase]);
				break;
				case 'boolean':
					if($shortCodeAtts[$keyLowerCase] == 'true'){
						$shortCodeAtts[$key] = true;
					} else {
						$shortCodeAtts[$key] = false;
					}
				break;
				case 'array':
				case 'object':
					$shortCodeAtts[$key] = json_decode($shortCodeAtts[$keyLowerCase]);
				break;
				default:
					$shortCodeAtts[$key] = $shortCodeAtts[$keyLowerCase];
				break;
			}
			if($key != $keyLowerCase) {
				unset($shortCodeAtts[$keyLowerCase]);
			}
		}
	}
	return phonicscore_opensheetmusicdisplay_render_callback($shortCodeAtts, $content);
}

function phonicscore_opensheetmusicdisplay_shortcode_init(){
	add_shortcode('opensheetmusicdisplay', 'phonicscore_opensheetmusicdisplay_shortcode_callback');
}

function phonicscore_opensheetmusicdisplay_enqueue_scripts(){
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'1.4.3',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay-wordpress-block.min.js', __FILE__ ) ),
		array( ),
		'0.1.1',
		true
	);
	wp_add_inline_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		 phonicscore_opensheetmusicdisplay_generate_client_attributes(),
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_frontend_script',
		esc_url( plugins_url( 'build/osmd/osmd-loader.min.js', __FILE__ ) ),
		array( 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist', 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports' ),
		'1.1.7',
		true
	);
}
function phonicscore_opensheetmusicdisplay_enqueue_admin_scripts($hook){
    if ( 'post.php' != $hook && 'post-new.php' != $hook ) {
        return;
    }
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'1.4.3',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay-wordpress-block.min.js', __FILE__ ) ),
		array( ),
		'0.1.1',
		true
	);
	wp_add_inline_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		 phonicscore_opensheetmusicdisplay_generate_client_attributes(),
	);
	wp_enqueue_script(
		'fredmeister77_queueable_attributes_dist',
		esc_url( plugins_url( 'build/osmd/queueable_attributes.min.js', __FILE__ ) ),
		array( ),
		'0.1.1',
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
phonicscore_opensheetmusicdisplay_MultipleMimes::init();

function phonicscore_opensheetmusicdisplay_admin_notices() {
    ?>
    <div class="notice notice-warning is-dismissible">
        <p><?php _e( '<strong>Heads up!</strong> The OpenSheetMusicDisplay Block will no longer automatically rerender on resize in the editor. It will still automatically resize for the frontend.', 'phonicscore_opensheetmusicdisplay' ); ?></p>
    </div>
    <?php
}

function phonicscore_opensheetmusicdisplay_activate_plugin(){
	if(function_exists('register_block_type')){
		add_action( 'init', 'phonicscore_opensheetmusicdisplay_block_init' );
	}
	add_action( 'init', 'phonicscore_opensheetmusicdisplay_shortcode_init' );
	add_action( 'wp_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_scripts' );
	if(function_exists('register_block_type')){
		add_action( 'admin_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_admin_scripts' );
		if (current_user_can('edit_posts') && is_admin()){
			$resizeUpdateMessageViewed = get_user_meta(get_current_user_id(), 'phonicscore_opensheetmusicdisplay_resize_update_message_viewed', true);
			if($resizeUpdateMessageViewed === '' || $resizeUpdateMessageViewed == false){
				add_action( 'admin_notices', 'phonicscore_opensheetmusicdisplay_admin_notices' );
				update_user_meta(get_current_user_id(), 'phonicscore_opensheetmusicdisplay_resize_update_message_viewed', true);
			}
		}
	}
}

add_action('plugins_loaded', 'phonicscore_opensheetmusicdisplay_activate_plugin', 10);

?>