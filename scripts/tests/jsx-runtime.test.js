const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const vm = require( 'node:vm' );
const React = require( 'react' );

const bundle = fs.readFileSync(
	path.resolve( __dirname, '../../build/osmd/react-jsx-runtime.min.js' ),
	'utf8'
);
function runtime( native ) {
	const sandbox = { React, ReactJSXRuntime: native };
	sandbox.window = sandbox;
	vm.runInNewContext( bundle, sandbox );
	return sandbox.ReactJSXRuntime;
}

test( 'preserves a native WordPress runtime', () => {
	const native = require( 'react/jsx-runtime' );
	assert.equal( runtime( native ), native );
} );

test( 'fallback preserves children, fragments, refs and React default props', () => {
	const jsx = runtime();
	const ref = React.createRef();
	const child = jsx.jsx( 'span', { ref, children: 'score' }, 'child' );
	const fragment = jsx.jsxs( jsx.Fragment, { children: [ child ] } );
	assert.equal( jsx.Fragment, React.Fragment );
	assert.equal( child.props.ref, ref );
	assert.equal( child.props.children, 'score' );
	assert.equal( fragment.props.children[ 0 ], child );
	function Component() {}
	Component.defaultProps = { enabled: true };
	assert.equal( jsx.jsx( Component, {} ).props.enabled, true );
} );

test( 'fallback follows native key precedence without mutating input props', () => {
	const jsx = runtime();
	const props = { key: 'props-key', children: 'score' };
	assert.equal( jsx.jsx( 'span', props, 'argument-key' ).key, 'props-key' );
	assert.equal(
		jsx.jsx( 'span', { key: undefined }, 'argument-key' ).key,
		'argument-key'
	);
	assert.equal( jsx.jsx( 'span', {}, 0 ).key, '0' );
	assert.equal(
		jsx.jsxDEV( 'span', {}, 'development-key' ).key,
		'development-key'
	);
	assert.deepEqual( props, { key: 'props-key', children: 'score' } );
} );
