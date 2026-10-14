import { createElement, Fragment } from 'react';

// WordPress 6.3–6.5 supplies React but has no react-jsx-runtime script handle.
// Use only public React APIs; current WordPress uses its native runtime.
function jsx( type, props, key ) {
	// As in the native runtime, a key carried in props takes precedence.
	const config =
		key === undefined || props?.key !== undefined
			? props
			: { ...props, key };
	return createElement( type, config );
}

if ( ! window.ReactJSXRuntime ) {
	window.ReactJSXRuntime = { Fragment, jsx, jsxs: jsx, jsxDEV: jsx };
}
