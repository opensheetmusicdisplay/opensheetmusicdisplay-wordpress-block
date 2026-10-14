const fs = require( 'node:fs' );
const { spawnSync } = require( 'node:child_process' );
const path = require( 'node:path' );
const { checkAudit } = require( './audit-policy' );

const root = path.resolve( __dirname, '..' );
const result = spawnSync(
	process.execPath,
	[ process.env.npm_execpath, 'audit', '--json' ],
	{
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 16 * 1024 * 1024,
	}
);

try {
	if ( result.error || ! [ 0, 1 ].includes( result.status ) ) {
		throw result.error || new Error( result.stderr || 'npm audit failed.' );
	}
	const audit = JSON.parse( result.stdout );
	const lock = JSON.parse(
		fs.readFileSync( path.join( root, 'package-lock.json' ), 'utf8' )
	);
	const violations = checkAudit( audit, lock );
	if ( violations.length ) {
		throw new Error(
			`Unapproved audit findings: ${ violations.join( ', ' ) }`
		);
	}
	console.log( JSON.stringify( audit.metadata.vulnerabilities ) );
	console.log(
		'Audit policy passed: only the documented development-only braces advisory may remain.'
	);
} catch ( error ) {
	console.error( error.message );
	process.exitCode = 1;
}
