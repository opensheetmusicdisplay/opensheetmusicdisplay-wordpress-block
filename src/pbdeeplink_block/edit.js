/**
 * Internal Dependencies
 */

/**
 * Wordpress Dependencies
 */
import { InspectorControls, BlockControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, PanelBody, RadioControl, ButtonGroup, Modal, IconButton, Icon, Dashicon } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { mobile, info } from '@wordpress/icons';
import {useState} from '@wordpress/element';

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
import { useEffect } from '@wordpress/element';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */

//To track our previous deeplink result across renders
 let deepLinkResult = {};
const Edit = ({attributes, setAttributes}) => {
	const blockProps = useBlockProps();

	const onSelectMedia = (media) => {
		setAttributes({
			musicXmlId: media.id,
			musicXmlUrl: media.url,
			musicXmlTitle: media.title
		});
	}

	const width = attributes.scale * PracticeBirdDeepLink.DEFAULT_QR_SIZE;
	const height = attributes.scale * PracticeBirdDeepLink.DEFAULT_QR_SIZE;

	const qrCode = React.createRef();
	const mobileIcon = React.createRef();
	useEffect(() => {
		if(attributes.musicXmlUrl){
			if(deepLinkResult.clear){
				deepLinkResult.clear();
			}
			deepLinkResult = PracticeBirdDeepLink.DeepLinkQR(attributes.musicXmlUrl, qrCode.current, mobileIcon.current,
							{generateBehavior: attributes.renderType, width, height});
			if(deepLinkResult.error && qrCode.current){
				console.error("PracticeBirdDeepLink: " + result.message + " from block: " + attributes.musicXmlUrl);
				qrCode.current.innerText = __(deepLinkResult.message);
			} else if (deepLinkResult.warn){
				console.warn("PracticeBirdDeepLink: " + deepLinkResult.message + " from block: " + attributes.musicXmlUrl);
			}
		}
	},
	[attributes.musicXmlUrl, attributes.scale, attributes.renderType]);
	
    const [ isRenderExplanationVisible, setIsRenderExplanationVisible ] = useState( false );
	const closeModal = () =>{setIsRenderExplanationVisible(false)};
	return (
		<div { ...blockProps }>
			{
				<BlockControls>
					
				</BlockControls>
			}
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
						<br/>
						{ isRenderExplanationVisible && 
						<Modal style={{maxWidth: "600px"}} title={__("Render Type Description")} onRequestClose={closeModal}>
							<ul>
								<li>
								<strong>&#8226;{__(" Responsive - QR and Icon:")}</strong>{__(" Both a QR code and icon for mobile devices will be generated. Which one is displayed will depend on the device screen size: greater than 991px for QR code, less than 992px for linked icon.")}
								</li>
								<li>
								<strong>&#8226;{__(" QR Code Only:")}</strong>{__(" Only a QR code will be generated and displayed regardless of device size or type.")}
								</li>
								<li>
								<strong>&#8226;{__(" Icon Only:")}</strong>{__(" Only a icon w/ a link will be generated and displayed regardless of device size or type.")}
								</li>
								<li>
								<strong>&#8226;{__(" Smart Detect - QR or Icon:")}</strong>{__(" The device will attempt to be detected. If iOS or Android is detected, a mobile icon will be generated. For all other platforms, a QR code will be generated.")}
								</li>
							</ul>
							<center>
								<Button variant="primary" onClick={ closeModal }>
									Close
								</Button>
							</center>
						</Modal> 
						}
						<RadioControl
							label={
								<span>
									{__("Render Behavior")}&nbsp;
									<IconButton
									icon={info}
									onClick={() =>{setIsRenderExplanationVisible(true)} }
									size={18}
									style={{
										padding: 0,
										margin: 0,
										minWidth: "18px",
										minHeight: "18px",
										width: "18px",
										height: "18px",
										verticalAlign: "middle"
									}}
									>
									</IconButton>
								</span>
							}
							selected={attributes.renderType}
							options={[
								{label: __("Responsive - QR and Icon"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_AND_MOBILE},
								{label: __("QR Code Only"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_ONLY},
								{label: __("Icon Only"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY},
								{label: __("Smart Detect - QR or Icon"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.DETECT},
							]}
							onChange={(value) => setAttributes({renderType: parseInt(value, 10)})}
						>
									
						</RadioControl>
					</PanelBody>
					<PanelBody
						title={__('QR Code Options')}
						initialOpen = { false }
					>

					</PanelBody>
					<PanelBody
						title={__('Icon Options')}
						initialOpen = { false }
					>
						
					</PanelBody>
				</InspectorControls>
			}
			{	attributes.musicXmlId > -1 ?
				<div className="phonicscore_practicebird_deeplink__render-block">
					<div ref={qrCode} />
					<div ref={mobileIcon} />
				</div> : 
				<h4>{__('No MusicXML Selected.')}</h4>
			}
		</div>
	);
}

export default withSelect( (select, props) => {
	const { getMedia } = select('core');
	return { media: props.attributes.musicXmlId > -1 ? getMedia(props.attributes.musicXmlId) : undefined };
} )(Edit);
