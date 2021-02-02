import { OSMDOptions } from 'opensheetmusicdisplay';

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
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
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
	icon: 'playlist-audio',

	/**
	 * Optional block extended support features.
	 */
	supports: {
		// Removes support for an HTML mode.
		html: false,
	},

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
			default: 0
		},
		autoBeam: {
			type: 'boolean',
			default: false
		},
		autoBeamOptions: {
			type: 'object',
			default: {
				beam_middle_rests_only: false,
				beam_rests: false,
				maintain_stem_directions: false
			}
		},
		autoResize: {
			type: 'boolean',
			default: true
		},
		backend: {
			type: 'string',
			default: 'svg'
		},
		coloringMode: {
			type: 'number',
			default: undefined
		},
		coloringSetCustom: {
			type: 'array',
			default: undefined
		},
		coloringEnabled: {
			type: 'boolean',
			default: true
		},
		colorStemsLikeNoteheads: {
			type: 'boolean',
			default: false
		},
		defaultColorNotehead: {
			type: 'string',
			default: undefined
		},
		defaultColorStem: {
			type: 'string',
			default: undefined
		},
		defaultColorRest: {
			type: 'string',
			default: undefined
		},
		defaultColorLabel: {
			type: 'string',
			default: undefined
		},
		defaultColorTitle: {
			type: 'string',
			default: undefined
		},
		defaultFontFamily: {
			type: 'string',
			default: undefined
		},
		defaultFontStyle: {
			type: 'number',
			default: 0
		},
		disableCursor: {
			type: 'boolean',
			default: true
		},
		followCursor: {
			type: 'boolean',
			default: false
		},
		drawingParameters: {
			type: 'string',
			default: undefined
		},
		drawCredits: {
			type: 'boolean',
			default: true
		},
		drawTitle: {
			type: 'boolean',
			default: true
		},
		drawSubtitle: {
			type: 'boolean',
			default: true
		},
		drawComposer: {
			type: 'boolean',
			default: true
		},
		drawLyricist: {
			type: 'boolean',
			default: true
		},
		drawMetronomeMarks: {
			type: 'boolean',
			default: true
		},
		drawPartNames: {
			type: 'boolean',
			default: true
		},
		drawPartAbbreviations: {
			type: 'boolean',
			default: true
		},
		drawMeasureNumbers: {
			type: 'boolean',
			default: true
		},
		drawMeasureNumbersOnlyAtSystemStart: {
			type: 'boolean',
			default: false
		},
		drawTimeSignatures: {
			type: 'boolean',
			default: true
		},
		measureNumberInterval: {
			type: 'number',
			default: 2
		},
		useXMLMeasureNumbers: {
			type: 'boolean',
			default: true
		},
		drawFingerings: {
			type: 'boolean',
			default: true
		},
		fingeringPosition: {
			type: 'string',
			default: undefined
		},
		fingeringInsideStafflines: {
			type: 'boolean',
			default: false
		},
		drawLyrics: {
			type: 'boolean',
			default: true
		},
		drawSlurs: {
			type: 'boolean',
			default: true
		},
		drawUpToMeasureNumber: {
			type: 'number',
			default: undefined
		},
		drawUpToSystemNumber: {
			type: 'number',
			default: undefined
		},
		drawUpToPageNumber: {
			type: 'number',
			default: undefined
		},
		drawFromMeasureNumber: {
			type: 'number',
			default: undefined
		},
		fillEmptyMeasuresWithWholeRest: {
			type: 'number',
			default: 0
		},
		setWantedStemDirectionByXml: {
			type: 'boolean',
			default: true
		},
		tupletsRatioed: {
			type: 'boolean',
			default: false
		},
		tupletsBracketed: {
			type: 'boolean',
			default: false
		},
		tripletsBracketed: {
			type: 'boolean',
			default: false
		},
		pageFormat: {
			type: 'string',
			default: undefined
		},
		pageBackgroundColor: {
			type: 'string',
			default: undefined
		},
		renderSingleHorizontalStaffline: {
			type: 'boolean',
			default: false
		},
		newSystemFromXML: {
			type: 'boolean',
			default: false
		},
		newPageFromXML: {
			type: 'boolean',
			default: false
		},
		percussionOneLineCutoff: {
			type: 'number',
			default: 4
		},
		percussionForceVoicesOneLineCutoff: {
			type: 'number',
			default: 3
		},
		spacingFactorSoftmax: {
			type: 'number',
			default: 5
		},
		spacingBetweenTextLines: {
			type: 'number',
			default: undefined
		},
		stretchLastSystemLine: {
			type: 'boolean',
			default: false
		},
		autoGenerateMutipleRestMeasuresFromRestMeasures: {
			type: 'boolean',
			default: true
		},
		width: {
			type: 'number',
			default: 100.0
		},
		zoom: {
			type: 'number',
			default: 1.0
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
		}
	}
} );
