import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { CheckboxControl, Button, PanelBody, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { OpenSheetMusicDisplayComponent } from './OpenSheetMusicDisplayComponent.jsx';
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
	//TODO: add button to batch update settings instead of live. since render is so expensive on larger scores
	return (
		<div { ...useBlockProps() } style={{width: attributes.width + '%'}}>
			{
				<InspectorControls>
					<PanelBody
						title={__('Basic Options')}
						initialOpen = { true }
						>
						<div className="musicxml-selector">
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
											{attributes.musicXmlId > -1 ? 'Current Score: ' + attributes.musicXmlTitle : 'No MusicXML selected.'}
											</strong>
										</sub>
										<br/>
										<Button 
											isPrimary= {true}
											onClick={open}
										>
											{__('Select Media')}
										</Button>
									</div>
								)}
							/>
						</MediaUploadCheck>
						</div>
						<NumberControl
								label="Width (%)"
								min={10.0}
								onChange={ (val) => setAttributes( { width: parseInt(val, 10) } ) }
								value={ attributes.width }
							>
							</NumberControl>
							<NumberControl
								label="Zoom (%)"
								min={1}
								onChange={ (val) => setAttributes( { zoom: val / 100.0 } ) }
								value={ attributes.zoom * 100 }
							>
							</NumberControl>
					</PanelBody>
					<PanelBody
						title={__('Drawing Options')}
						initialOpen = { false }
						>
							<CheckboxControl
								label="Draw Title"
								checked={ attributes.drawTitle }
								onChange={ (val) => setAttributes( { drawTitle: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Subtitle"
								checked={ attributes.drawSubtitle }
								onChange={ (val) => setAttributes( { drawSubtitle: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Composer"
								checked={ attributes.drawComposer }
								onChange={ (val) => setAttributes( { drawComposer: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Lyricist"
								checked={ attributes.drawLyricist }
								onChange={ (val) => setAttributes( { drawLyricist: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Metronome Marks"
								checked={ attributes.drawMetronomeMarks }
								onChange={ (val) => setAttributes( { drawMetronomeMarks: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Part Names"
								checked={ attributes.drawPartNames }
								onChange={ (val) => setAttributes( { drawPartNames: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Part Abbreviations"
								checked={ attributes.drawPartAbbreviations }
								onChange={ (val) => setAttributes( { drawPartAbbreviations: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Measure Numbers"
								checked={ attributes.drawMeasureNumbers }
								onChange={ (val) => setAttributes( { drawMeasureNumbers: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Measure Numbers Only at System Start"
								checked={ attributes.drawMeasureNumbersOnlyAtSystemStart }
								onChange={ (val) => setAttributes( { drawMeasureNumbersOnlyAtSystemStart: val } ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Time Signatures"
								checked={ attributes.drawTimeSignatures }
								onChange={ (val) => setAttributes( { drawTimeSignatures: val } ) }
							>
							</CheckboxControl>
						</PanelBody>
				</InspectorControls>
			}
			<OpenSheetMusicDisplayComponent 
				file={ attributes.musicXmlUrl }
				width={ attributes.width }
				zoom= { attributes.zoom }
				drawTitle= { attributes.drawTitle }
				drawSubtitle= { attributes.drawSubtitle }
				drawComposer= { attributes.drawComposer }
				drawLyricist= { attributes.drawLyricist }
				drawMetronomeMarks= { attributes.drawMetronomeMarks }
				drawPartNames= { attributes.drawPartNames }
				drawPartAbbreviations= { attributes.drawPartAbbreviations }
				drawMeasureNumbers= { attributes.drawMeasureNumbers }
				drawMeasureNumbersOnlyAtSystemStart= { attributes.drawMeasureNumbersOnlyAtSystemStart }
				drawTimeSignatures= { attributes.drawTimeSignatures }
			/>
		</div>
	);
}

export default withSelect( (select, props) => {
	const { getMedia } = select('core');
	return { media: props.attributes.musicXmlId > -1 ? getMedia(props.attributes.musicXmlId) : undefined };
} )(Edit);