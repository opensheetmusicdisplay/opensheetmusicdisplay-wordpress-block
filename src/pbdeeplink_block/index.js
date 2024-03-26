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
import icons from '../block_assets/icons';
/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
//wrapper to ensure filters that are registered elsewhere (extensions/plugins to this block) are fired
wp.domReady(() => {

registerBlockType( 'phonicscore/practicebird-deeplink', {
	/**
	 * @see https://make.wordpress.org/core/2020/11/18/block-api-version-2/
	 */
	apiVersion: 2,

	/**
	 * This is the display title for your block, which can be translated with `i18n` functions.
	 * The block inserter will show this name.
	 */
	title: __( 'PracticeBird QR Code', 'practicebird_deeplink' ),

	/**
	 * This is a short description for your block, can be translated with `i18n` functions.
	 * It will be shown in the Block Tab in the Settings Sidebar.
	 */
	description: __(
		'Block to render QR codes/icons that deep-link musicXML into the PracticeBird iOS/Android app.',
		'practicebird_deeplink'
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
	icon: icons.practicebird,

	/**
	 * Optional block extended support features.
	 */
	supports: {
		// Removes support for an HTML mode.
		html: false,
	},

	keywords: [__('musicxml'), __('sheet music'), __('practicebird')],

	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save: ()=> {return null},
	
	attributes: {
		musicXmlId: {
			type: 'number',
			default: -1
		},
		target: {
			type: 'string',
			default: ''
		},
		musicXmlTitle: {
			type: 'string',
			default: ''
		},
		generateBehavior: {
			type: "number",
			default: 0
		},
		qrScale: {
			type: 'number',
			default: 1.0
		},
		size: {
			type: 'number',
			default: PracticeBirdDeepLink.DEFAULT_QR_SIZE
		},
		iconSize: {
			type: "number",
			default: 180
		},
		autoRedirectAppStore: {
			type: "boolean",
			default: true
		}
	}
} );
});