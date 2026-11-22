import { spawn, spawnSync } from 'node:child_process';
spawnSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--file', 'schema.sql'], { stdio: 'inherit' });
const run = (...a) => spawn('npx', a, { stdio: 'inherit' });
const vars = ['BAZE_API_KEY', 'BAZE_API_BASE'].filter(k => process.env[k]).flatMap(k => ['--var', `${k}:${process.env[k]}`]);
const api = run('wrangler', 'dev', '--ip', '0.0.0.0', '--port', '8787', ...vars);
const web = run('vite', '--host', '0.0.0.0', '--port', '5173', '--strictPort');
const stop = () => { api.kill(); web.kill(); process.exit(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop); web.on('exit', stop);
