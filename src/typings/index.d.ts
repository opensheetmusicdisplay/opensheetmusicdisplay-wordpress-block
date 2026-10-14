import { createHooks } from '@wordpress/hooks';

declare module 'opensheetmusicdisplay-wordpress-block' {
	const OpenSheetMusicDisplayGlobalHooks: ReturnType< typeof createHooks >;
	export default OpenSheetMusicDisplayGlobalHooks;
}
