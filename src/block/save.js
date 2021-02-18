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
	const nonSerializedAttributes = [
		'musicXmlUrl',
		'zoom',
		'width',
		'aspectRatio',
		'autoRender',
		'plugins'
	];
	const items = [];
	if(typeof attributes === 'object'){
		for(let [key, value] of Object.entries(attributes)){
			let type = typeof value;
			if(type === 'boolean'){
				if(value){
					value = 'true';
				} else {
					value = 'false';
				}
			} else if(type === 'object' || type === 'array'){
				try{
					value = JSON.stringify(value);
				} catch(error){
					console.warn(`Error serializing value for key: ${key} defaulting to '{}'.`, error);
					value = '{}';
				}
			}
			if(!nonSerializedAttributes.contains(key)){
				items.push(<input type="hidden" attributeType={type} key={key} name={key} value={value} />);
			}
		}
	}
	return (
		<div { ...useBlockProps.save() }>
			<div className="phonicscore-opensheetmusicdisplay__placeholder">
				<div></div>
				<div className="phonicscore-opensheetmusicdisplay__loading-spinner hide" />
				<div className="phonicscore-opensheetmusicdisplay__render-block" style={{width: `${attributes.width.toString()}%`}}/>
				{items}
				<input type="hidden" className="musicXmlUrl" name="musicXmlUrl" value={attributes.musicXmlUrl} />
				<input type="hidden" className="zoom" name="zoom" value={attributes.zoom} />
				<input type="hidden" className="aspectRatio" name="aspectRatio" value={attributes.aspectRatio} />
			</div>
		</div>
	);
}
