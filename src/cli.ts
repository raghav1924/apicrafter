import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MemoryStore } from './core/store.js';
import { MockServer } from './server/mock-server.js';
import { WebStudio } from './ui/web.js';
import { TypeScriptTypeGenerator } from './core/codegen.js';
import { log, colors } from './utils/logger.js';

interface CliArgs {
  command: string;
  port: number;
  webPort: number;
  delay: number;
  chaosRate: number;
  noWeb: boolean;
  outFile?: string;
  configFile?: string;
  help: boolean;
  version: boolean;
}

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    command: 'start',
    port: 4000,
    webPort: 5050,
    delay: 0,
    chaosRate: 0.0,
    noWeb: false,
    help: false,
    version: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--version' || arg === '-v') {
      result.version = true;
    } else if (arg === '--no-web') {
      result.noWeb = true;
    } else if ((arg === '--port' || arg === '-p') && i + 1 < args.length) {
      result.port = parseInt(args[++i], 10) || 4000;
    } else if ((arg === '--web-port' || arg === '-w') && i + 1 < args.length) {
      result.webPort = parseInt(args[++i], 10) || 5050;
    } else if ((arg === '--delay' || arg === '-d') && i + 1 < args.length) {
      result.delay = parseInt(args[++i], 10) || 0;
    } else if ((arg === '--chaos' || arg === '-c') && i + 1 < args.length) {
      result.chaosRate = parseFloat(args[++i]) || 0.0;
    } else if ((arg === '--out' || arg === '-o') && i + 1 < args.length) {
      result.outFile = args[++i];
    } else if (arg.startsWith('-')) {
      // unrecognized flag
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    result.command = positional[0].toLowerCase();
  }

  return result;
}

function printBanner(): void {
  console.log(`
${colors.cyan}  ▲ ApiCrafter v1.0.0${colors.reset}
  ${colors.dim}Stateful REST Mock Server, Chaos Latency Injector & Visual Studio${colors.reset}
  ${colors.dim}Built by Jatin Sharma (${colors.underline}https://jatinsh.netlify.app/${colors.reset}${colors.dim})${colors.reset}
`);
}

function printHelp(): void {
  printBanner();
  console.log(`
${colors.bold}USAGE:${colors.reset}
  $ apicrafter [command] [options]

${colors.bold}COMMANDS:${colors.reset}
  start                   Start the stateful REST mock engine & visual web studio (default)
  types, codegen          Generate TypeScript type declarations for mock collections
  seed                    Output sample mock database JSON schema to stdout
  help                    Show this help guide

${colors.bold}OPTIONS:${colors.reset}
  -p, --port <number>      Port for Mock REST API (default: 4000)
  -w, --web-port <number>  Port for Interactive Web Studio (default: 5050)
  -d, --delay <ms>         Simulate base network latency in milliseconds (default: 0)
  -c, --chaos <rate>       Chaos failure rate between 0.0 (0%) and 1.0 (100%) (default: 0)
  --no-web                 Disable visual web studio server
  -o, --out <path>         Output file path for generated TypeScript declarations
  -h, --help               Show help menu
  -v, --version            Show version number

${colors.bold}EXAMPLES:${colors.reset}
  $ apicrafter start --port 4000 --web-port 5050
  $ apicrafter start --delay 350 --chaos 0.15
  $ apicrafter types --out ./src/types/api.ts
  $ apicrafter seed > db.seed.json
`);
}

export async function runCli(rawArgs: string[]): Promise<void> {
  const args = parseArgs(rawArgs.slice(2));

  if (args.help || args.command === 'help') {
    printHelp();
    return;
  }

  if (args.version || args.command === 'version') {
    console.log('apicrafter v1.0.0');
    return;
  }

  const store = new MemoryStore();

  switch (args.command) {
    case 'types':
    case 'codegen': {
      const tsCode = TypeScriptTypeGenerator.generate(store);
      if (args.outFile) {
        const dest = resolve(process.cwd(), args.outFile);
        writeFileSync(dest, tsCode, 'utf-8');
        log.success(`Generated TypeScript declarations written to: ${dest}`);
      } else {
        console.log(tsCode);
      }
      break;
    }

    case 'seed': {
      const dump: Record<string, any> = {};
      for (const col of store.getCollections()) {
        dump[col] = store.getAll(col);
      }
      console.log(JSON.stringify(dump, null, 2));
      break;
    }

    case 'start':
    default: {
      printBanner();

      const mockServer = new MockServer({
        port: args.port,
        webPort: args.webPort,
        chaos: {
          delayMs: args.delay,
          errorRate: args.chaosRate,
          errorCodes: [500, 503],
        },
      }, store);

      await mockServer.start();

      log.success(`REST Mock Engine running at ${colors.cyan}http://localhost:${args.port}/api${colors.reset}`);
      for (const col of store.getCollections()) {
        const count = (store.getAll(col) || []).length;
        console.log(`   ${colors.green}•${colors.reset} http://localhost:${args.port}/api/${col} (${count} items seeded)`);
      }

      if (!args.noWeb) {
        WebStudio.serve(mockServer, args.webPort);
        log.success(`Visual Studio & Live Inspector at ${colors.magenta}http://localhost:${args.webPort}${colors.reset}`);
      }

      console.log(`\n${colors.dim}Press Ctrl+C to terminate.${colors.reset}\n`);
      break;
    }
  }
}
