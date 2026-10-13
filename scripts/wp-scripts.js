const { getHashes } = require('crypto');
const { spawnSync } = require('child_process');

// This WordPress build toolchain uses MD4 for asset hashes. Node 17+ requires
// the legacy OpenSSL provider, including in the webpack child process.
const env = { ...process.env };
if (!getHashes().includes('md4')) {
    env.NODE_OPTIONS = [env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ');
}

const result = spawnSync(
    process.execPath,
    [require.resolve('@wordpress/scripts/bin/wp-scripts.js'), ...process.argv.slice(2)],
    { stdio: 'inherit', env }
);

if (result.error) {
    console.error(result.error);
}
process.exit(result.status === null ? 1 : result.status);
