const { execFileSync } = require( 'node:child_process' );
const { engines } = require( '../package.json' );

const npmVersion = execFileSync(
	process.execPath,
	[ process.env.npm_execpath, '--version' ],
	{ encoding: 'utf8' }
).trim();

if ( process.versions.node !== engines.node || npmVersion !== engines.npm ) {
	console.error(
		`Use Node ${ engines.node } and npm ${ engines.npm }; found Node ${ process.versions.node } and npm ${ npmVersion }.`
	);
	process.exitCode = 1;
}
