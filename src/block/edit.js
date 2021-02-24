/**
 * Internal Dependencies
 */
import { OpenSheetMusicDisplay } from '../Components/OpenSheetMusicDisplay.jsx';

/**
 * Wordpress Dependencies
 */
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Card, CardBody, SelectControl, CheckboxControl, Button, PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

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

	//TODO: Need this model to be extensible
	const updateAttributes = () => {
		setAttributes({
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
		});
	};

	let [autoRenderTimeoutObject, setAutoRenderTimeoutObject] = useState(undefined);
	//TODO: Would be good to make this available to plugins from here
	const updateState = (attributeName, newValue, stateCallback, delay = 0 ) => {
		stateCallback(newValue);
		const newAttObject = {};
		newAttObject[attributeName] = newValue;
		if(delay > 0){
			clearTimeout(autoRenderTimeoutObject);
			const timeoutReturnObject = setTimeout(function(){
				if(attributes.autoRender){
					setAttributes(newAttObject);
				}
			}, delay);
			setAutoRenderTimeoutObject(timeoutReturnObject);
		} else {
			if(attributes.autoRender){
				setAttributes(newAttObject);
			}
		}
	};

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
		{label: __('Auto (No Scrollbar)'), value: 'auto'},
		{label: __('Landscape'), value: 'landscape'},
		{label: __('Portrait'), value: 'portrait'},
		{label: __('Custom'), value: 'custom'}
	];

	const blockProps = useBlockProps();

	const translateAspectRatioToHeight = (aspectRatio) => {
		if(!blockProps.ref.current || aspectRatio === 0.0 || !blockProps.ref.current.offsetWidth){
			return 'auto';
		} else {
			return (blockProps.ref.current.offsetWidth / aspectRatio).toString() + 'px';
		}
	};

	let pluginProps = {};

	if(attributes.plugins && attributes.plugins.length > 0){
		for(let i = 0; i < attributes.plugins.length; i++){
			const currentPluginProps = attributes.plugins[i].getOpenSheetMusicDisplayProps(attributes);
			if(typeof currentPluginProps === 'object'){
				pluginProps = {
					...pluginProps,
					...currentPluginProps
				};
			}
		}
	}
	return (
		<div { ...blockProps } style={{width: attributes.width + '%', height: translateAspectRatioToHeight(attributes.aspectRatio)}}>
			{
				<InspectorControls>
					<Card>
					<CardBody>
						<CheckboxControl
							label={__('Automatically Rerender on Change')}
							checked={ attributes.autoRender }
							onChange={ (val) => {
								setAttributes( {autoRender: val } );
								if(val){
									updateAttributes();
								}
							} }
						>
						</CheckboxControl>
							<Button
								disabled={attributes.autoRender}
								isPrimary= {true}
								onClick={() => updateAttributes()}
							>
								{__('Rerender')}
							</Button>
						</CardBody>
						</Card>
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
							<TextControl
								label={__('Width (%)')}
								type='number'
								min={10.0}
								max={100.0}
								step={1}
								onChange={ (val) => updateState('width', parseInt(val, 10), setWidth, 500) }
								value={ width }
							>
							</TextControl>
							<SelectControl
								label={__('Container Aspect Ratio')}
								value={ aspectRatioString }
								onChange={ ( val ) => setAspectRatio( val ) }
								options = { aspectRatioDropdownOptions }
							>
							</SelectControl>
							{ aspectRatioString === 'custom' ?
							<TextControl
								label={__('Custom Aspect Ratio')}
								type='number'
								min={0.1}
								onChange={ (val) => setAttributes( {aspectRatio: val} ) }
								value={ attributes.aspectRatio }
							>
							</TextControl> : null
							}
							<TextControl
								label={__('Zoom (%)')}
								type='number'
								min={10}
								onChange={ (val) => updateState('zoom', parseInt(val, 10) / 100.0, setZoom, 500)}
								value={ Math.floor(zoom * 100) }
							>
							</TextControl>
					</PanelBody>
					<PanelBody
						title={__('Drawing Options')}
						initialOpen = { false }
						>
							<CheckboxControl
								label={__('Draw Title')}
								checked={ drawTitle }
								onChange={(val) => updateState('drawTitle', val, setDrawTitle, 0)}
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Subtitle')}
								checked={ drawSubtitle }
								onChange={(val) => updateState('drawSubtitle', val, setDrawSubtitle, 0)}
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Composer')}
								checked={ drawComposer }
								onChange={ (val) => updateState('drawComposer', val, setDrawComposer, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Lyricist')}
								checked={ drawLyricist }
								onChange={ (val) => updateState('drawLyricist', val, setDrawLyricist, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Metronome Marks')}
								checked={ drawMetronomeMarks }
								onChange={ (val) => updateState('drawMetronomeMarks', val, setDrawMetronomeMarks, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Part Names')}
								checked={ drawPartNames }
								onChange={ (val) => updateState('drawPartNames', val, setDrawPartNames, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Part Abbreviations')}
								checked={ drawPartAbbreviations }
								onChange={ (val) => updateState('drawPartAbbreviations', val, setDrawPartAbbreviations, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Measure Numbers')}
								checked={ drawMeasureNumbers }
								onChange={ (val) => updateState('drawMeasureNumbers', val, setDrawMeasureNumbers, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Measure Numbers Only at System Start')}
								checked={ drawMeasureNumbersOnlyAtSystemStart }
								onChange={ (val) => updateState('drawMeasureNumbersOnlyAtSystemStart', val, setDrawMeasureNumbersOnlyAtSystemStart, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Time Signatures')}
								checked={ drawTimeSignatures }
								onChange={ (val) => updateState('drawTimeSignatures', val, setDrawTimeSignatures, 0) }
							>
							</CheckboxControl>
						</PanelBody>
				</InspectorControls>
			}
			{	attributes.musicXmlId > -1 ?
				<OpenSheetMusicDisplay 
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
					maxReloadAttempts={5}
					plugins={attributes.plugins}
					{...pluginProps}
				/> : <h4>{__('No MusicXML Selected.')}</h4>
			}
		</div>
	);
}

export default withSelect( (select, props) => {
	const { getMedia } = select('core');
	return { media: props.attributes.musicXmlId > -1 ? getMedia(props.attributes.musicXmlId) : undefined };
} )(Edit);