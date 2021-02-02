/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save({attributes}) {
	const items = [];
	if(typeof attributes === 'object'){
		for(let [key, value] of Object.entries(attributes)){
			if(typeof value === 'boolean'){
				if(value){
					value = 'true';
				} else {
					value = 'false';
				}
			}
			if(key !== 'musicXmlUrl'){
				items.push(<input type="hidden" key={key} name={key} value={value} />);
			}
		}
	}
	return (
		<div { ...useBlockProps.save() }>
			<div className="osmd-container-placeholder">
				<div className="loader" />
				<div className="osmd-render-block"/>
				{items}
				<input type="hidden" className="musicXmlUrl" name="musicXmlUrl" value={attributes.musicXmlUrl} />
			</div>
		</div>
	);
}
