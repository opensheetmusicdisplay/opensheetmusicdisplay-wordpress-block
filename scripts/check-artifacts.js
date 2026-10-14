const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const { execFileSync } = require( 'node:child_process' );
const { createHash } = require( 'node:crypto' );
const vm = require( 'node:vm' );

const root = path.resolve( __dirname, '..' );
const ownScripts = [
	'osmd_block',
	'pbdeeplink_block',
	'pbdeeplink_frontend',
	'osmd/queueable_attributes.min',
	'osmd/osmd-loader.min',
	'osmd/new_block_detection.min',
	'osmd/react-jsx-runtime.min',
	'osmd/opensheetmusicdisplay-wordpress-block.min',
];
const expectedDependencies = {
	osmd_block: [
		'react-jsx-runtime',
		'wp-block-editor',
		'wp-blocks',
		'wp-components',
	],
	pbdeeplink_block: [
		'react-jsx-runtime',
		'wp-block-editor',
		'wp-components',
	],
	'osmd/queueable_attributes.min': [ 'react-jsx-runtime' ],
	'osmd/new_block_detection.min': [ 'wp-data' ],
	'osmd/react-jsx-runtime.min': [ 'react' ],
	'osmd/opensheetmusicdisplay-wordpress-block.min': [
		'react',
		'react-jsx-runtime',
		'wp-hooks',
	],
};

for ( const name of ownScripts ) {
	const source = fs.readFileSync(
		path.join( root, 'build', name + '.js' ),
		'utf8'
	);
	assert.doesNotMatch(
		source,
		/React v\d|__SECRET_INTERNALS_DO_NOT_USE|__CLIENT_INTERNALS_DO_NOT_USE/,
		`${ name } bundles a React implementation`
	);
	const asset = JSON.parse(
		execFileSync(
			'php',
			[
				'-r',
				'echo json_encode(require $argv[1]);',
				path.join( root, 'build', name + '.asset.php' ),
			],
			{ encoding: 'utf8' }
		)
	);
	assert.ok(
		Array.isArray( asset.dependencies ) && asset.version,
		`${ name }: incomplete asset metadata`
	);
	for ( const dependency of expectedDependencies[ name ] || [] ) {
		assert.ok(
			asset.dependencies.includes( dependency ),
			`${ name }: missing ${ dependency }`
		);
	}
}

for ( const name of [ 'osmd_block', 'pbdeeplink_block' ] ) {
	const metadataPath = path.join( root, 'build', name + '.json' );
	const metadata = JSON.parse( fs.readFileSync( metadataPath, 'utf8' ) );
	assert.equal( metadata.apiVersion, 3 );
	function checkPaths( value ) {
		if ( typeof value === 'string' && value.startsWith( 'file:' ) ) {
			assert.ok(
				fs.existsSync(
					path.resolve(
						path.dirname( metadataPath ),
						value.slice( 5 )
					)
				),
				value
			);
		} else if ( value && typeof value === 'object' ) {
			Object.values( value ).forEach( checkPaths );
		}
	}
	checkPaths( metadata );
	for ( const prefix of [ '', 'style-' ] ) {
		assert.ok(
			fs.existsSync(
				path.join( root, 'build/styles', prefix + name + '.css' )
			)
		);
	}
}

const copies = {
	opensheetmusicdisplay: {
		'build/opensheetmusicdisplay.min.js':
			'osmd/opensheetmusicdisplay.min.js',
	},
	'pb-deep-link': {
		'dist/endpoint.min.js': 'pbdeeplink/endpoint.min.js',
		'dist/qrcode.min.js': 'pbdeeplink/qrcode.min.js',
		'dist/responsive_shim.min.css': 'pbdeeplink/responsive_shim.min.css',
	},
};
const inputs = JSON.parse(
	fs.readFileSync( path.join( root, 'library-inputs.json' ), 'utf8' )
);
for ( const [ name, assets ] of Object.entries( copies ) ) {
	for ( const [ source, destination ] of Object.entries( assets ) ) {
		const hash = createHash( 'sha256' )
			.update(
				fs.readFileSync( path.join( root, 'build', destination ) )
			)
			.digest( 'hex' );
		assert.equal(
			hash,
			inputs[ name ].assets[ source ],
			`${ destination }: library asset changed`
		);
	}
}

const sandbox = {
	React: { PureComponent: class {}, createElement: () => ( {} ) },
	ReactJSXRuntime: { jsx: () => ( {} ), jsxs: () => ( {} ) },
	wp: { hooks: { createHooks: () => ( {} ) } },
};
sandbox.window = sandbox;
vm.runInNewContext(
	fs.readFileSync(
		path.join(
			root,
			'build/osmd/opensheetmusicdisplay-wordpress-block.min.js'
		),
		'utf8'
	),
	sandbox
);
for ( const name of [
	'OpenSheetMusicDisplay',
	'OpenSheetMusicDisplayGlobalHooks',
	'OpenSheetMusicDisplayReactPluginTemplate',
	'OpenSheetMusicDisplayWordpressPlugin',
	'renderBraille',
	'BRAILLE_ATTRIBUTE_NAMES',
] ) {
	assert.ok(
		sandbox[ 'opensheetmusicdisplay-wordpress-block' ][ name ],
		`Missing extension export: ${ name }`
	);
}
console.log(
	'Build artifacts, dependencies, globals and copied library hashes verified.'
);
