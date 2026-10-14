const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { checkAudit, allowedAdvisory } = require( '../audit-policy' );

function fixture() {
	return {
		audit: {
			metadata: {},
			vulnerabilities: {
				braces: {
					severity: 'high',
					nodes: [ 'node_modules/braces' ],
					via: [ { url: allowedAdvisory } ],
				},
				tool: {
					severity: 'high',
					nodes: [ 'node_modules/tool' ],
					via: [ 'braces' ],
				},
			},
		},
		lock: {
			packages: {
				'node_modules/braces': { dev: true },
				'node_modules/tool': { dev: true },
			},
		},
	};
}

test( 'allows only the known build advisory and its inherited findings', () => {
	const { audit, lock } = fixture();
	assert.deepEqual( checkAudit( audit, lock ), [] );
} );

test( 'rejects an unrelated advisory even in an otherwise allowed dependency', () => {
	const { audit, lock } = fixture();
	audit.vulnerabilities.braces.via.push( {
		url: 'https://github.com/advisories/GHSA-new-issue',
	} );
	assert.deepEqual( checkAudit( audit, lock ), [ 'braces', 'tool' ] );
} );

test( 'rejects production paths and missing locked nodes', () => {
	const { audit, lock } = fixture();
	lock.packages[ 'node_modules/braces' ].dev = false;
	delete lock.packages[ 'node_modules/tool' ];
	assert.deepEqual( checkAudit( audit, lock ), [ 'braces', 'tool' ] );
} );

test( 'rejects critical findings and unknown ancestry', () => {
	const { audit, lock } = fixture();
	audit.vulnerabilities.braces.severity = 'critical';
	audit.vulnerabilities.tool.via = [ 'missing' ];
	assert.deepEqual( checkAudit( audit, lock ), [ 'braces', 'tool' ] );
} );

test( 'fails closed when the registry returns an error', () => {
	assert.throws(
		() => checkAudit( { error: {} }, { packages: {} } ),
		/incomplete/
	);
} );
