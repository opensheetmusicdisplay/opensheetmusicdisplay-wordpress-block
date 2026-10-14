const fs = require( 'node:fs' );
const path = require( 'node:path' );
const { createHash } = require( 'node:crypto' );
const { execFileSync } = require( 'node:child_process' );

const root = path.resolve( __dirname, '..' );
const manifestPath = path.join( root, 'library-inputs.json' );
const libraries = {
	opensheetmusicdisplay: {
		path: '../opensheetmusicdisplay',
		assets: [ 'build/opensheetmusicdisplay.min.js' ],
	},
	'pb-deep-link': {
		path: '../pb-deep-link',
		assets: [
			'dist/endpoint.min.js',
			'dist/qrcode.min.js',
			'dist/responsive_shim.min.css',
		],
	},
};

function inspectInputs() {
	const inputs = {};
	for ( const [ name, library ] of Object.entries( libraries ) ) {
		const directory = path.resolve( root, library.path );
		const pkg = JSON.parse(
			fs.readFileSync( path.join( directory, 'package.json' ), 'utf8' )
		);
		const commit = execFileSync(
			'git',
			[ '-C', directory, 'rev-parse', 'HEAD' ],
			{ encoding: 'utf8' }
		).trim();
		inputs[ name ] = {
			path: library.path,
			commit,
			version: pkg.version || null,
			assets: Object.fromEntries(
				library.assets.map( ( asset ) => [
					asset,
					createHash( 'sha256' )
						.update(
							fs.readFileSync( path.join( directory, asset ) )
						)
						.digest( 'hex' ),
				] )
			),
		};
	}
	return inputs;
}

try {
	const current = inspectInputs();
	if ( process.argv.includes( '--update' ) ) {
		fs.writeFileSync(
			manifestPath,
			JSON.stringify( current, null, '\t' ) + '\n'
		);
		console.log(
			'Recorded linked library commits, versions and built-asset hashes.'
		);
	} else {
		const recorded = JSON.parse( fs.readFileSync( manifestPath, 'utf8' ) );
		if ( JSON.stringify( current ) !== JSON.stringify( recorded ) ) {
			throw new Error(
				'Linked library inputs changed. Review the new builds, then run npm run inputs:update.'
			);
		}
		console.log(
			'Linked library inputs match the recorded release assets.'
		);
	}
} catch ( error ) {
	if ( process.argv.includes( '--development' ) ) {
		console.warn( error.message );
	} else {
		console.error( error.message );
		process.exitCode = 1;
	}
}
