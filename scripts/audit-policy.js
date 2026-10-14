const allowedAdvisory = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';

// Match advisory ancestry and locked dev flags, never a whole package or severity.
function checkAudit( audit, lock ) {
	if (
		audit.error ||
		! audit.metadata ||
		! audit.vulnerabilities ||
		! lock.packages
	) {
		throw new Error( 'Audit or lockfile data is incomplete.' );
	}
	const violations = [];
	const vulnerabilities = audit.vulnerabilities;
	function origins( name, visited = new Set() ) {
		if ( visited.has( name ) ) {
			return [];
		}
		const vulnerability = vulnerabilities[ name ];
		if ( ! vulnerability ) {
			return [ 'unknown advisory ancestry' ];
		}
		const nextVisited = new Set( [ ...visited, name ] );
		return ( vulnerability.via || [] ).flatMap( ( entry ) =>
			typeof entry === 'string'
				? origins( entry, nextVisited )
				: [ entry.url ]
		);
	}
	for ( const [ name, vulnerability ] of Object.entries( vulnerabilities ) ) {
		const urls = origins( name );
		const nodes = vulnerability.nodes || [];
		const developmentOnly =
			nodes.length > 0 &&
			nodes.every( ( node ) => lock.packages[ node ]?.dev === true );
		if (
			vulnerability.severity === 'critical' ||
			! developmentOnly ||
			! urls.length ||
			urls.some( ( url ) => url !== allowedAdvisory )
		) {
			violations.push( name );
		}
	}
	return violations;
}

module.exports = { checkAudit, allowedAdvisory };
