import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { SelectControl, CheckboxControl, Button, PanelBody, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { OpenSheetMusicDisplayComponent } from './OpenSheetMusicDisplayComponent.jsx';
import { withSelect } from "@wordpress/data";
import {useState} from 'react';

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
	const [width, setWidth] = useState(attributes.width);
	const [zoom, setZoom] = useState(attributes.zoom);
	const [drawTitle, setDrawTitle] = useState(attributes.drawTitle);
	const [drawSubtitle, setDrawSubtitle] = useState(attributes.drawSubtitle);
	const [drawComposer, setDrawComposer] = useState(attributes.drawComposer);
	const [drawLyricist, setDrawLyricist] = useState(attributes.drawLyricist);
	const [drawMetronomeMarks, setDrawMetronomeMarks] = useState(attributes.drawMetronomeMarks);
	const [drawPartNames, setDrawPartNames] = useState(attributes.drawPartNames);
	const [drawPartAbbreviations, setDrawPartAbbreviations] = useState(attributes.drawPartAbbreviations);
	const [drawMeasureNumbers, setDrawMeasureNumbers] = useState(attributes.drawMeasureNumbers);
	const [drawMeasureNumbersOnlyAtSystemStart, setDrawMeasureNumbersOnlyAtSystemStart] = useState(attributes.drawMeasureNumbersOnlyAtSystemStart);
	const [drawTimeSignatures, setDrawTimeSignatures] = useState(attributes.drawTimeSignatures);

	let aspectRatioStringInit = '';
	if(attributes.aspectRatio === 0.0){
		aspectRatioStringInit = 'auto';
	} else if (attributes.aspectRatio === 1.5){
		aspectRatioStringInit = 'landscape';
	} else if (attributes.aspectRatio === 0.5625){
		aspectRatioStringInit = 'portrait';
	} else {
		aspectRatioStringInit = 'custom';
	}
	const [aspectRatioString, setAspectRatioString] = useState(aspectRatioStringInit);

	const setAspectRatio = (value) => {
		switch(value){
			case 'auto':
				setAttributes({aspectRatio: 0.0});
			break;
			case 'landscape':
				setAttributes({aspectRatio: 1.5});
			break;
			case 'portrait':
				setAttributes({aspectRatio: 0.5625});
			break;
		}
		setAspectRatioString(value);
	};

	const aspectRatioDropdownOptions = [
		{label: "Auto (No Scrollbar)", value: "auto"},
		{label: "Landscape", value: "landscape"},
		{label: "Portrait", value: "portrait"},
		{label: "Custom", value: "custom"}
	];

	const blockProps = useBlockProps();

	const translateAspectRatioToHeight = (aspectRatio) => {
		if(!blockProps.ref.current || aspectRatio === 0.0 || !blockProps.ref.current.offsetWidth){
			return 'auto';
		} else {
			return (blockProps.ref.current.offsetWidth / aspectRatio).toString() + 'px';
		}
	};

	return (
		<div { ...blockProps } style={{width: attributes.width + '%', height: translateAspectRatioToHeight(attributes.aspectRatio)}}>
			{
				<InspectorControls>
					<Button 
						isPrimary= {true}
						onClick={() => setAttributes({
							width: width,
							zoom: zoom,
							drawTitle: drawTitle,
							drawSubtitle: drawSubtitle,
							drawComposer: drawComposer,
							drawLyricist: drawLyricist,
							drawMetronomeMarks: drawMetronomeMarks,
							drawPartNames: drawPartNames,
							drawPartAbbreviations: drawPartAbbreviations,
							drawMeasureNumbers: drawMeasureNumbers,
							drawMeasureNumbersOnlyAtSystemStart: drawMeasureNumbersOnlyAtSystemStart,
							drawTimeSignatures: drawTimeSignatures
						})}
					>
						{__('Rerender')}
					</Button>
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
						<NumberControl
								label="Width (%)"
								min={10.0}
								onChange={ (val) => setWidth( parseInt(val, 10) ) }
								value={ width }
							>
							</NumberControl>
							<SelectControl
								label="Container Aspect Ratio"
								value={ aspectRatioString }
								onChange={ ( val ) => setAspectRatio( val ) }
								options = { aspectRatioDropdownOptions }
							>
							</SelectControl>
							{ aspectRatioString === 'custom' ?
							<NumberControl
								label="Custom Aspect Ratio"
								min={0.1}
								onChange={ (val) => setAttributes( {aspectRatio: val} ) }
								value={ attributes.aspectRatio }
							>
							</NumberControl> : null
							}
							<NumberControl
								label="Zoom (%)"
								min={1}
								onChange={ (val) => setZoom( val / 100.0 ) }
								value={ zoom * 100 }
							>
							</NumberControl>
					</PanelBody>
					<PanelBody
						title={__('Drawing Options')}
						initialOpen = { false }
						>
							<CheckboxControl
								label="Draw Title"
								checked={ drawTitle }
								onChange={ (val) => setDrawTitle( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Subtitle"
								checked={ drawSubtitle }
								onChange={ (val) => setDrawSubtitle( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Composer"
								checked={ drawComposer }
								onChange={ (val) => setDrawComposer( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Lyricist"
								checked={ drawLyricist }
								onChange={ (val) => setDrawLyricist( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Metronome Marks"
								checked={ drawMetronomeMarks }
								onChange={ (val) => setDrawMetronomeMarks( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Part Names"
								checked={ drawPartNames }
								onChange={ (val) => setDrawPartNames( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Part Abbreviations"
								checked={ drawPartAbbreviations }
								onChange={ (val) => setDrawPartAbbreviations( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Measure Numbers"
								checked={ drawMeasureNumbers }
								onChange={ (val) => setDrawMeasureNumbers( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Measure Numbers Only at System Start"
								checked={ drawMeasureNumbersOnlyAtSystemStart }
								onChange={ (val) => setDrawMeasureNumbersOnlyAtSystemStart( val ) }
							>
							</CheckboxControl>
							<CheckboxControl
								label="Draw Time Signatures"
								checked={ drawTimeSignatures }
								onChange={ (val) => setDrawTimeSignatures( val ) }
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