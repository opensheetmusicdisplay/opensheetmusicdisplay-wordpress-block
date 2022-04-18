/**
 * Internal Dependencies
 */

/**
 * Wordpress Dependencies
 */
import { InspectorControls, BlockControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, PanelBody, RadioControl, Modal, IconButton, RangeControl, ResizableBox, ToggleControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { info } from '@wordpress/icons';
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
const deepLinkResults = new Map();
const HelpTextRenderType = (generateBehavior) => {
	switch (generateBehavior) {
		case PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_ONLY:
			return __("Only a QR code will be displayed, regardless of device type or screen size.");
		break;
		case PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY:
			return __("Only an icon w/ deep-link will be displayed, regardless of device type or screen size.");
		break;
		case PracticeBirdDeepLink.DeepLinkGenerateBehavior.DETECT:
			return __("An attempt will be made to detect mobile devices which will render the icon - Otherwise, the QR code.");
		break;
		case PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_AND_MOBILE:
		default:
			return __(" Both a QR code and icon for mobile devices will be generated. Screen size determines which is displayed.");
		break;
	}
}
const Edit = ({attributes, setAttributes, toggleSelection, clientId}) => {
	const blockProps = useBlockProps();
	const onSelectMedia = (media) => {
		setAttributes({
			musicXmlId: media.id,
			target: media.url,
			musicXmlTitle: media.title
		});
	}
/*
	const QR_SIZE_TO_SCALE_ENUM = {
		SMALL: 0.5,
		MEDIUM: 1.0,
		LARGE: 1.5
	}; */
	const qrCode = React.createRef();
	const mobileIcon = React.createRef();
	let deepLinkResult = {};
	if(deepLinkResults.has(clientId)){
		deepLinkResult = deepLinkResults.get(clientId);
	}
	useEffect(() => {
		if(attributes.target){
			if(deepLinkResult.clear){
				deepLinkResult.clear();
			}
			deepLinkResult = PracticeBirdDeepLink.DeepLinkQR(attributes.target, qrCode.current, mobileIcon.current,
							{generateBehavior: attributes.generateBehavior, size: attributes.size,
								//TODO: Populate from server
							endpointUrl: '/?phonicscore_practicebird_deeplink_endpoint=1'});
			if(deepLinkResult.error && qrCode.current){
				console.error("PracticeBirdDeepLink: " + result.message + " from block: " + attributes.target);
				qrCode.current.innerText = __(deepLinkResult.message);
			} else if (deepLinkResult.warn){
				console.warn("PracticeBirdDeepLink: " + deepLinkResult.message + " from block: " + attributes.target);
			}
			deepLinkResults.set(clientId, deepLinkResult);
		}
	},
	[attributes.target, attributes.qrScale, attributes.generateBehavior]);

	let mobileEditClassName = "";
	if(attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_ONLY ||
		(attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.DETECT &&
		 deepLinkResult.generatedIcon === undefined)){
		mobileEditClassName = "hidden";
	} else if(attributes.generateBehavior !== PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY){
		mobileEditClassName = "hidden-md hidden-lg";
	}
	
    const [ isRenderExplanationVisible, setIsRenderExplanationVisible ] = useState( false );
	const closeRenderExplanationModal = () =>{setIsRenderExplanationVisible(false)};

    const [ isAutoRedirectExplanationVisible, setIsAutoRedirectExplanationVisible ] = useState( false );
	const closeAutoRedirectExplanationModal = () =>{setIsAutoRedirectExplanationVisible(false)};
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
						<Modal style={{maxWidth: "600px"}} title={__("Render Type Description")} onRequestClose={closeRenderExplanationModal}>
							<ul>
								<li>
								<strong>{__("Responsive - QR and Icon:")}</strong>{__(" Both a QR code and icon for mobile devices will be generated. Which one is displayed will depend on the device screen size: greater than 991px for QR code, less than 992px for linked icon.")}
								</li>
								<li>
								<strong>{__("QR Code Only:")}</strong>{__(" Only a QR code will be generated and displayed regardless of device size or type.")}
								</li>
								<li>
								<strong>{__("Icon Only:")}</strong>{__(" Only a icon w/ a link will be generated and displayed regardless of device size or type.")}
								</li>
								<li>
								<strong>{__("Smart Detect - QR or Icon:")}</strong>{__(" The device will attempt to be detected. If iOS or Android is detected, a mobile icon will be generated. For all other platforms, a QR code will be generated.")}
								</li>
							</ul>
							<center>
								<Button variant="primary" onClick={ closeRenderExplanationModal }>
								{__("Close")}
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
									onClick={() =>setIsRenderExplanationVisible(true) }
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
							selected={attributes.generateBehavior}
							options={[
								{label: __("Responsive - QR and Icon"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_AND_MOBILE},
								{label: __("QR Code Only"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.QR_ONLY},
								{label: __("Icon Only"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY},
								{label: __("Smart Detect - QR or Icon"), value: PracticeBirdDeepLink.DeepLinkGenerateBehavior.DETECT},
							]}
							help={HelpTextRenderType(attributes.generateBehavior)}
							onChange={(value) => setAttributes({generateBehavior: parseInt(value, 10)})}
						>
									
						</RadioControl>
					</PanelBody>
					<PanelBody
						title={__('QR Code Options')}
						initialOpen = { false }
					>
						<RangeControl
							disabled={attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY}
							label={__("Scale")}
							value={ attributes.qrScale }
							onChange={ ( value ) => setAttributes( {qrScale: value, size: parseInt(value * PracticeBirdDeepLink.DEFAULT_QR_SIZE, 10)} ) }
							min={ 0.5 }
							max={ 1.5 }
							step={0.1}
							marks={true}
						></RangeControl>
					</PanelBody>
					<PanelBody
						title={__('Icon Options')}
						initialOpen = { false }
					>
					{ isAutoRedirectExplanationVisible && 
					<Modal style={{maxWidth: "600px"}} title={__("Auto-Redirect Description")} onRequestClose={closeAutoRedirectExplanationModal}>
						<ul>
							<li>
							<strong>{__("On: ")}</strong>{__("If the mobile deep-link icon is displayed and the deep-link fails on click, an attempt will be made to detect the mobile platform and redirect to the proper PracticeBird app store link (Android or iOS).")}
							</li>
							<li>
							<strong>{__("Off: ")}</strong>{__("No attempt to redirect will be made, and if the deeplink fails, it will fail silently with the page not reacting.")}
							</li>
						</ul>
						<center>
							<Button variant="primary" onClick={ closeAutoRedirectExplanationModal }>
								{__("Close")}
							</Button>
						</center>
					</Modal> 
					}
					<ToggleControl
						label={
							<span>
							{__("Auto-redirect to App Store")}&nbsp;
							<IconButton
							icon={info}
							onClick={() =>setIsAutoRedirectExplanationVisible(true) }
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
						</span>}
						help={
							attributes.autoRedirectAppStore
								? 'Will attempt redirecting to app store on deep-link failure.'
								: 'Will fail silently, no redirection occuring.'
						}
						checked={ attributes.autoRedirectAppStore }
						onChange={ () => setAttributes({autoRedirectAppStore: !attributes.autoRedirectAppStore}) }
					/>
					</PanelBody>
				</InspectorControls>
			}
			{	attributes.musicXmlId > -1 ?
				<div className="phonicscore_practicebird_deeplink__render-block">
					<div ref={qrCode} />
					{

					}
					<ResizableBox className={mobileEditClassName}
						style={{margin: "5px"}}
						lockAspectRatio={true}
						size={ {
							height: attributes.iconSize,
							width: attributes.iconSize,
						} }
						minHeight="50"
						minWidth="50"
						maxHeight="180"
						maxWidth="180"
						enable={ {
							top: false,
							right: false,
							bottom: false,
							left: false,
							topRight: true,
							bottomRight: true,
							bottomLeft: true,
							topLeft: true,
						} }
						onResizeStop={ ( event, direction, elt, delta ) => {
							setAttributes( {
								iconSize: parseInt( attributes.iconSize + delta.width, 10 ),
							} );
							toggleSelection( true );
						} }
						onResizeStart={ () => {
							toggleSelection( false );
						} }>
						<div ref={mobileIcon} />
					</ResizableBox>
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



/*
						<ButtonGroup title={__("Size")} disabled={attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY}>
							<IconButton 
								variant="secondary" 
								icon={image} 
								size={16}
								onClick={() => setAttributes({qrScale: QR_SIZE_TO_SCALE_ENUM.SMALL})}
								isPressed={attributes.qrScale === QR_SIZE_TO_SCALE_ENUM.SMALL}
								disabled={attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY}
							></IconButton>
							<IconButton 
								variant="secondary" 
								icon={image} 
								size={24}
								onClick={() => setAttributes({qrScale: QR_SIZE_TO_SCALE_ENUM.MEDIUM})}
								isPressed={attributes.qrScale === QR_SIZE_TO_SCALE_ENUM.MEDIUM}
								disabled={attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY}
							></IconButton>
							<IconButton 
								variant="secondary" 
								icon={image} 
								size={32}
								onClick={() => setAttributes({qrScale: QR_SIZE_TO_SCALE_ENUM.LARGE})}
								isPressed={attributes.qrScale === QR_SIZE_TO_SCALE_ENUM.LARGE}
								disabled={attributes.generateBehavior === PracticeBirdDeepLink.DeepLinkGenerateBehavior.MOBILE_ONLY}
							></IconButton>
						</ButtonGroup>
*/