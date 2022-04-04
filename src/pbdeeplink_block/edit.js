/**
 * Internal Dependencies
 */

/**
 * Wordpress Dependencies
 */
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

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
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
const Edit = ({attributes, setAttributes}) => {
	const blockProps = useBlockProps();

	const onSelectMedia = (media) => {
		setAttributes({
			musicXmlId: media.id,
			musicXmlUrl: media.url,
			musicXmlTitle: media.title
		});
	}
	return (
		<div { ...blockProps }>
			{
				<InspectorControls>
					<PanelBody
						title={__('Basic Options')}
						initialOpen = { true }
						>
						<div className='musicxml-selector'>
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={ ['application/vnd.recordare.musicxml',
												'application/vnd.recordare.musicxml+xml',            
												'text/xml',
												'application/xml'
											] }
								onSelect={onSelectMedia}
								value={attributes.musicXmlId}
								render={({open}) => (
									<div>
										<sub>
											<strong>
											{ __(attributes.musicXmlId > -1 ? `Current Score: ${attributes.musicXmlTitle}` : 'No MusicXML selected.')}
											</strong>
										</sub>
										<br/>
										<Button 
											isSecondary= {true}
											onClick={open}
										>
											{__('Select Media')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
						</div>
					</PanelBody>
				</InspectorControls>
			}
			{	attributes.musicXmlId > -1 ?
				<div/> : 
				<h4>{__('No MusicXML Selected.')}</h4>
			}
		</div>
	);
}

export default withSelect( (select, props) => {
	const { getMedia } = select('core');
	return { media: props.attributes.musicXmlId > -1 ? getMedia(props.attributes.musicXmlId) : undefined };
} )(Edit);
