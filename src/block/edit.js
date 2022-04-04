/**
 * Internal Dependencies
 */
import { OpenSheetMusicDisplay } from '../Components/OpenSheetMusicDisplay.jsx';
import OpenSheetMusicDisplayReactPluginManager from '../Models/OpenSheetMusicDisplayReactPluginManager';
import {OpenSheetMusicDisplayGlobalHooks, OpenSheetMusicDisplayWordpressPlugin} from 'opensheetmusicdisplay-wordpress-block';

/**
 * Wordpress Dependencies
 */
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { withFilters, Card, CardBody, SelectControl, CheckboxControl, Button, PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

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

//Process custom filters (we have a filter registered to add a plugin)
const OpenSheetMusicDisplayWithFilters = withFilters( 'phonicscore_opensheetmusicdisplay_plugin' )( OpenSheetMusicDisplay );
const pluginManager = new OpenSheetMusicDisplayReactPluginManager();
const wpPlugin = new OpenSheetMusicDisplayWordpressPlugin('phonicscore/opensheetmusicdisplay/wordpress-plugin-hooks', OpenSheetMusicDisplayGlobalHooks);
pluginManager.registerPlugin(wpPlugin);

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
const Edit = ({attributes, setAttributes, queueableAttributes, queueAttribute, commitAttributes}) => {
	const blockProps = useBlockProps();

	const onSelectMedia = (media) => {
		setAttributes({
			musicXmlId: media.id,
			musicXmlUrl: media.url,
			musicXmlTitle: media.title
		});
	}

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
	
	const translateAspectRatioToHeight = (aspectRatio) => {
		if(!blockProps.ref.current || aspectRatio === 0.0 || !blockProps.ref.current.offsetWidth){
			return 'auto';
		} else {
			return (blockProps.ref.current.offsetWidth / aspectRatio).toString() + 'px';
		}
	};

	let OSMDProps = {
		file:  attributes.musicXmlUrl ,
		width:  attributes.width ,
		zoom:  attributes.zoom ,
		drawTitle:  attributes.drawTitle ,
		drawSubtitle:  attributes.drawSubtitle ,
		drawComposer:  attributes.drawComposer ,
		drawLyricist:  attributes.drawLyricist ,
		drawMetronomeMarks:  attributes.drawMetronomeMarks ,
		drawPartNames:  attributes.drawPartNames ,
		drawPartAbbreviations:  attributes.drawPartAbbreviations ,
		drawMeasureNumbers:  attributes.drawMeasureNumbers ,
		drawMeasureNumbersOnlyAtSystemStart:  attributes.drawMeasureNumbersOnlyAtSystemStart ,
		drawTimeSignatures:  attributes.drawTimeSignatures ,
		maxReloadAttempts: 5,
		newSystemFromXML: attributes.newSystemFromXML,
		pluginManager: pluginManager,
		rerenderDummy: attributes.rerenderDummy
	};
	
	let pluginProps = OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_block-props', OSMDProps, attributes, queueableAttributes);
	if(!pluginProps){
		pluginProps = {};
	}
	return (
		<div { ...blockProps } style={{width: attributes.width + '%', maxWidth: attributes.width + '%', height: translateAspectRatioToHeight(attributes.aspectRatio)}}>
			{
				<InspectorControls>
					<Card>
					<CardBody>
						<CheckboxControl
							label={__('Automatically Rerender on Change')}
							checked={ !attributes.queueAttributes }
							onChange={ (val) => {
								setAttributes( {queueAttributes: !val } );
								if(val){
									commitAttributes();
								}
							} }
						>
						</CheckboxControl>
							<Button
								isPrimary= {true}
								onClick={() => {queueAttribute('rerenderDummy', {}, 0); commitAttributes();}}
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
								onChange={ (val) => queueAttribute('width', parseInt(val, 10), 500) }
								value={ queueableAttributes.width.value }
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
								onChange={ (val) => queueAttribute('zoom', parseInt(val, 10) / 100, 500)}
								value={ Math.floor( queueableAttributes.zoom.value * 100) }
							>
							</TextControl>
					</PanelBody>
					<PanelBody
						title={__('Drawing Options')}
						initialOpen = { false }
						>
							<CheckboxControl
								label={__('Draw Title')}
								checked={ queueableAttributes.drawTitle.value }
								onChange={(val) => queueAttribute('drawTitle', val, 0)}
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Subtitle')}
								checked={ queueableAttributes.drawSubtitle.value }
								onChange={(val) => queueAttribute('drawSubtitle', val, 0)}
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Composer')}
								checked={ queueableAttributes.drawComposer.value }
								onChange={ (val) => queueAttribute('drawComposer', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Lyricist')}
								checked={ queueableAttributes.drawLyricist.value }
								onChange={ (val) => queueAttribute('drawLyricist', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Metronome Marks')}
								checked={ queueableAttributes.drawMetronomeMarks.value }
								onChange={ (val) => queueAttribute('drawMetronomeMarks', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Part Names')}
								checked={ queueableAttributes.drawPartNames.value }
								onChange={ (val) => queueAttribute('drawPartNames', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Part Abbreviations')}
								checked={ queueableAttributes.drawPartAbbreviations.value }
								onChange={ (val) => queueAttribute('drawPartAbbreviations', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Measure Numbers')}
								checked={ queueableAttributes.drawMeasureNumbers.value }
								onChange={ (val) => queueAttribute('drawMeasureNumbers', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Measure Numbers Only at System Start')}
								checked={ queueableAttributes.drawMeasureNumbersOnlyAtSystemStart.value }
								onChange={ (val) => queueAttribute('drawMeasureNumbersOnlyAtSystemStart', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('Draw Time Signatures')}
								checked={ queueableAttributes.drawTimeSignatures.value }
								onChange={ (val) =>  queueAttribute('drawTimeSignatures', val, 0) }
							>
							</CheckboxControl>
							<CheckboxControl
								label={__('New Systems From XML')}
								checked={ queueableAttributes.newSystemFromXML.value }
								onChange={ (val) =>  queueAttribute('newSystemFromXML', val, 0) }
							>
							</CheckboxControl>
						</PanelBody>
				</InspectorControls>
			}
			{	attributes.musicXmlId > -1 ?
				<OpenSheetMusicDisplayWithFilters
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
