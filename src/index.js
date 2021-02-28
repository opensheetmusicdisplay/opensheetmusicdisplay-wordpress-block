/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './block/style.scss';

/**
 * Internal dependencies
 */
import Edit from './block/edit';
import save from './block/save';
import icons from './block/icons';

import OpenSheetMusicDisplayEdit from './Components/OpenSheetMusicDisplayEdit.jsx';
/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
console.log("factory would init here");
//wrapper to ensure filters that are registered elsewhere (extensions/plugins to this block) are fired
wp.domReady(() => {

registerBlockType( 'phonicscore/opensheetmusicdisplay', {
	/**
	 * @see https://make.wordpress.org/core/2020/11/18/block-api-version-2/
	 */
	apiVersion: 2,

	/**
	 * This is the display title for your block, which can be translated with `i18n` functions.
	 * The block inserter will show this name.
	 */
	title: __( 'OpenSheetMusicDisplay', 'opensheetmusicdisplay' ),

	/**
	 * This is a short description for your block, can be translated with `i18n` functions.
	 * It will be shown in the Block Tab in the Settings Sidebar.
	 */
	description: __(
		'Block to render MusicXML in the browser as sheet music using OSMD.',
		'opensheetmusicdisplay'
	),

	/**
	 * Blocks are grouped into categories to help users browse and discover them.
	 * The categories provided by core are `text`, `media`, `design`, `widgets`, and `embed`.
	 */
	category: 'embed',

	/**
	 * An icon property should be specified to make it easier to identify a block.
	 * These can be any of WordPress’ Dashicons, or a custom svg element.
	 */
	icon: icons.osmd,

	/**
	 * Optional block extended support features.
	 */
	supports: {
		// Removes support for an HTML mode.
		html: false,
	},

	keywords: [__('musicxml'), __('sheet music'), __('osmd'), __('opensheetmusicdisplay')],

	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
	
	attributes: {
		alignRests: {
			type: 'number',
			default: 0,
			queueable: true
		},
		autoBeam: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		autoBeamOptions: {
			type: 'object',
			default: {
				beam_middle_rests_only: false,
				beam_rests: false,
				maintain_stem_directions: false
			},
			queueable: true
		},
		autoResize: {
			type: 'boolean',
			default: true
		},
		backend: {
			type: 'string',
			default: 'svg',
			queueable: true
		},
		coloringMode: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		coloringSetCustom: {
			type: 'array',
			default: undefined,
			queueable: true
		},
		coloringEnabled: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		colorStemsLikeNoteheads: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		defaultColorNotehead: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultColorStem: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultColorRest: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultColorLabel: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultColorTitle: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultFontFamily: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		defaultFontStyle: {
			type: 'number',
			default: 0,
			queueable: true
		},
		disableCursor: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		followCursor: {
			type: 'boolean',
			default: false
		},
		drawingParameters: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		drawCredits: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawTitle: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawSubtitle: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawComposer: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawLyricist: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawMetronomeMarks: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawPartNames: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawPartAbbreviations: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawMeasureNumbers: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawMeasureNumbersOnlyAtSystemStart: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		drawTimeSignatures: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		measureNumberInterval: {
			type: 'number',
			default: 2,
			queueable: true
		},
		useXMLMeasureNumbers: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawFingerings: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		fingeringPosition: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		fingeringInsideStafflines: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		drawLyrics: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawSlurs: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		drawUpToMeasureNumber: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		drawUpToSystemNumber: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		drawUpToPageNumber: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		drawFromMeasureNumber: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		fillEmptyMeasuresWithWholeRest: {
			type: 'number',
			default: 0,
			queueable: true
		},
		setWantedStemDirectionByXml: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		tupletsRatioed: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		tupletsBracketed: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		tripletsBracketed: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		pageFormat: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		pageBackgroundColor: {
			type: 'string',
			default: undefined,
			queueable: true
		},
		renderSingleHorizontalStaffline: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		newSystemFromXML: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		newPageFromXML: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		percussionOneLineCutoff: {
			type: 'number',
			default: 4,
			queueable: true
		},
		percussionForceVoicesOneLineCutoff: {
			type: 'number',
			default: 3,
			queueable: true
		},
		spacingFactorSoftmax: {
			type: 'number',
			default: 5,
			queueable: true
		},
		spacingBetweenTextLines: {
			type: 'number',
			default: undefined,
			queueable: true
		},
		stretchLastSystemLine: {
			type: 'boolean',
			default: false,
			queueable: true
		},
		autoGenerateMutipleRestMeasuresFromRestMeasures: {
			type: 'boolean',
			default: true,
			queueable: true
		},
		width: {
			type: 'number',
			default: 100.0,
			queueable: true
		},
		aspectRatio: {
			type: 'number',
			default: 0.0
		},
		zoom: {
			type: 'number',
			default: 1.0,
			queueable: true
		},
		musicXmlId: {
			type: 'number',
			default: -1
		},
		musicXmlUrl: {
			type: 'string',
			default: ''
		},
		musicXmlTitle: {
			type: 'string',
			default: ''
		},
		queueAttributes: {
			type: 'boolean',
			default: false
		},
		plugins: {
			type: 'array',
			default: []
		}
	}
} );
});