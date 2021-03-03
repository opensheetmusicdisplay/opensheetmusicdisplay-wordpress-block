<?php
/**
 * Plugin Name:     OpenSheetMusicDisplay
 * Description:     Block to render MusicXML in the browser as sheet music using OSMD.
 * Version:         0.9.4
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
 * @see https://developer.wordpress.org/block_editor/tutorials/block_tutorial/applying_styles_with_stylesheets/
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
			'attributes' => [
				'alignRests' => [
					'type' => 'number',
					'default' => 0
				],
				'autoBeam' => [
					'type' => 'boolean',
					'default' => false
				],
				'autoBeamOptions' => [
					'type' => 'object',
					'default' => [
						'beam_middle_rests_only' => false,
						'beam_rests' => false,
						'maintain_stem_directions' => false
					]
				],
				'autoResize' => [
					'type' => 'boolean',
					'default' => true
				],
				'backend' => [
					'type' => 'string',
					'default' => 'svg'
				],
				'coloringMode' => [
					'type' => 'number',
					'default' => null
				],
				'coloringSetCustom' => [
					'type' => 'array',
					'default' => null
				],
				'coloringEnabled' => [
					'type' => 'boolean',
					'default' => true
				],
				'colorStemsLikeNoteheads' => [
					'type' => 'boolean',
					'default' => false
				],
				'defaultColorNotehead' => [
					'type' => 'string',
					'default' => null
				],
				'defaultColorStem' => [
					'type' => 'string',
					'default' => null
				],
				'defaultColorRest' => [
					'type' => 'string',
					'default' => null
				],
				'defaultColorLabel' => [
					'type' => 'string',
					'default' => null
				],
				'defaultColorTitle' => [
					'type' => 'string',
					'default' => null
				],
				'defaultFontFamily' => [
					'type' => 'string',
					'default' => null
				],
				'defaultFontStyle' => [
					'type' => 'number',
					'default' => 0
				],
				'disableCursor' => [
					'type' => 'boolean',
					'default' => true
				],
				'followCursor' => [
					'type' => 'boolean',
					'default' => false
				],
				'drawingParameters' => [
					'type' => 'string',
					'default' => null
				],
				'drawCredits' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawTitle' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawSubtitle' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawComposer' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawLyricist' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawMetronomeMarks' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawPartNames' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawPartAbbreviations' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawMeasureNumbers' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawMeasureNumbersOnlyAtSystemStart' => [
					'type' => 'boolean',
					'default' => false
				],
				'drawTimeSignatures' => [
					'type' => 'boolean',
					'default' => true
				],
				'measureNumberInterval' => [
					'type' => 'number',
					'default' => 2
				],
				'useXMLMeasureNumbers' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawFingerings' => [
					'type' => 'boolean',
					'default' => true
				],
				'fingeringPosition' => [
					'type' => 'string',
					'default' => null
				],
				'fingeringInsideStafflines' => [
					'type' => 'boolean',
					'default' => false
				],
				'drawLyrics' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawSlurs' => [
					'type' => 'boolean',
					'default' => true
				],
				'drawUpToMeasureNumber' => [
					'type' => 'number',
					'default' => null
				],
				'drawUpToSystemNumber' => [
					'type' => 'number',
					'default' => null
				],
				'drawUpToPageNumber' => [
					'type' => 'number',
					'default' => null
				],
				'drawFromMeasureNumber' => [
					'type' => 'number',
					'default' => null
				],
				'fillEmptyMeasuresWithWholeRest' => [
					'type' => 'number',
					'default' => 0
				],
				'setWantedStemDirectionByXml' => [
					'type' => 'boolean',
					'default' => true
				],
				'tupletsRatioed' => [
					'type' => 'boolean',
					'default' => false
				],
				'tupletsBracketed' => [
					'type' => 'boolean',
					'default' => false
				],
				'tripletsBracketed' => [
					'type' => 'boolean',
					'default' => false
				],
				'pageFormat' => [
					'type' => 'string',
					'default' => null
				],
				'pageBackgroundColor' => [
					'type' => 'string',
					'default' => null
				],
				'renderSingleHorizontalStaffline' => [
					'type' => 'boolean',
					'default' => false
				],
				'newSystemFromXML' => [
					'type' => 'boolean',
					'default' => false
				],
				'newPageFromXML' => [
					'type' => 'boolean',
					'default' => false
				],
				'percussionOneLineCutoff' => [
					'type' => 'number',
					'default' => 4
				],
				'percussionForceVoicesOneLineCutoff' => [
					'type' => 'number',
					'default' => 3
				],
				'spacingFactorSoftmax' => [
					'type' => 'number',
					'default' => 5
				],
				'spacingBetweenTextLines' => [
					'type' => 'number',
					'default' => null
				],
				'stretchLastSystemLine' => [
					'type' => 'boolean',
					'default' => false
				],
				'autoGenerateMutipleRestMeasuresFromRestMeasures' => [
					'type' => 'boolean',
					'default' => true
				],
				'width' => [
					'type' => 'number',
					'default' => 100.0
				],
				'aspectRatio' => [
					'type' => 'number',
					'default' => 0.0
				],
				'zoom' => [
					'type' => 'number',
					'default' => 1.0
				],
				'musicXmlId' => [
					'type' => 'number',
					'default' => -1
				],
				'musicXmlUrl' => [
					'type' => 'string',
					'default' => ''
				],
				'musicXmlTitle' => [
					'type' => 'string',
					'default' => ''
				]
			]
		)
	);
}

function phonicscore_opensheetmusicdisplay_render_callback($block_attributes, $content){
	$asJson = wp_json_encode($block_attributes);
	var_dump($asJson);
	return $asJson;
	
	
	/*<<<EOT
		<div class="phonicscore-opensheetmusicdisplay__placeholder">
			<div class="phonicscore-opensheetmusicdisplay__loading-spinner hide"></div>
			<div class="phonicscore-opensheetmusicdisplay__render-block"></div>
			<div style="display:none;" class="attributesAsJson">$asJson</div>
		</div>
	EOT;*/
}

function phonicscore_opensheetmusicdisplay_enqueue_scripts(){
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'0.9.4',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay-wordpress-block.min.js', __FILE__ ) ),
		array( ),
		'0.1.0',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_frontend_script',
		esc_url( plugins_url( 'build/osmd/osmd-loader.min.js', __FILE__ ) ),
		array( 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist', 'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports' ),
		'0.1.0',
		true
	);
}
function phonicscore_opensheetmusicdisplay_enqueue_admin_scripts($hook){
    if ( 'post.php' != $hook ) {
        return;
    }
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay.min.js', __FILE__ ) ),
		array( ),
		'0.9.4',
		true
	);
	wp_enqueue_script(
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
		esc_url( plugins_url( 'build/osmd/opensheetmusicdisplay-wordpress-block.min.js', __FILE__ ) ),
		array( ),
		'0.1.0',
		true
	);
	wp_enqueue_script(
		'fredmeister77_queueable_attributes_dist',
		esc_url( plugins_url( 'build/osmd/queueable_attributes.min.js', __FILE__ ) ),
		array( ),
		'0.1.0',
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

function phonicscore_opensheetmusicdisplay_activate_plugin(){
	add_action( 'init', 'phonicscore_opensheetmusicdisplay_block_init' );
	add_action( 'wp_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_scripts' );
	add_action( 'admin_enqueue_scripts', 'phonicscore_opensheetmusicdisplay_enqueue_admin_scripts' );
}

add_action('plugins_loaded', 'phonicscore_opensheetmusicdisplay_activate_plugin', 10);