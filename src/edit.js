import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { CheckboxControl, Button, PanelBody } from '@wordpress/components';
import { OpenSheetMusicDisplay } from './OpenSheetMusicDisplayComponent.jsx';
import { withSelect } from "@wordpress/data";

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
	const onSelectMedia = (media) => {
		setAttributes({
			musicXmlId: media.id,
			musicXmlUrl: media.url,
			musicXmlTitle: media.title
		});
	}

	return (
		<div { ...useBlockProps() }>
			{
				<InspectorControls>
						<div className="musicxml-selector">
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={ ['application/vnd.recordare.musicxml', 'application/vnd.recordare.musicxml+xml'] }
								onSelect={onSelectMedia}
								value={attributes.musicXmlId}
								render={({open}) => (
									<Button 
										onClick={open}
									>
										{attributes.musicXmlId == -1 && __('Choose a MusicXML File')}
										{attributes.musicXmlId > -1 && attributes.musicXmlTitle}
									</Button>
								)}
							/>
						</MediaUploadCheck>
						</div>
					<PanelBody
						title={__('Options')}
						initialOpen = { true }
						>
							<CheckboxControl
								label="Render Title"
								checked={ attributes.drawTitle }
								onChange={ (val) => setAttributes( { drawTitle: val } ) }
							>
							</CheckboxControl>
						</PanelBody>

				</InspectorControls>
			}
			<OpenSheetMusicDisplay file={ attributes.musicXmlUrl } options= { attributes.osmdOptions } />
		</div>
	);
}

export default withSelect( (select, props) => {
	const { getMedia } = select('core');
	return { media: props.attributes.musicXmlId > -1 ? getMedia(props.attributes.musicXmlId) : undefined };
} )(Edit);