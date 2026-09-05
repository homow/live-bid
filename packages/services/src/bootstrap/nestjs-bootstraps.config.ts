export const colors = {
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
} as const;

export const thenBootstraps = (
  {
    port,
    graphqlPath = '/graphql',
    wsPath = '/graphql',
  }: {
    port: number | string;
    graphqlPath?: string;
    wsPath?: string;
  }
) => {
  const graphqlUrl = `http://localhost:${port}${graphqlPath}`;
  const wsUrl = `ws://localhost:${port}${wsPath}`;

  console.log(`
${colors.bold}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.cyan}║${colors.reset}  ${colors.bold}${colors.green}✦ GRAPHQL SERVER STARTED SUCCESSFULLY ✦${colors.reset}      ${colors.bold}${colors.cyan}║${colors.reset}
${colors.bold}${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.bold}${colors.white}📊 SYSTEM INFO${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.cyan}●${colors.reset} ${colors.bold}Environment${colors.reset}         ${colors.green}${process.env.NODE_ENV || 'development'}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Process ID${colors.reset}           ${colors.yellow}${process.pid}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Node Version${colors.reset}         ${colors.magenta}${process.version}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Platform${colors.reset}             ${colors.blue}${process.platform}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Started At${colors.reset}           ${colors.gray}${new Date().toLocaleString()}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.bold}${colors.green}✅ GraphQL server is ready${colors.reset}

${colors.bold}${colors.white}🔌 ENDPOINTS${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.green}●${colors.reset} ${colors.bold}GraphQL Playground${colors.reset}  ${colors.cyan}${colors.underline}${graphqlUrl}${colors.reset}
${colors.blue}●${colors.reset} ${colors.bold}GraphQL Endpoint${colors.reset}    ${colors.blue}${colors.underline}${graphqlUrl}${colors.reset}
${colors.yellow}●${colors.reset} ${colors.bold}WebSocket Endpoint${colors.reset} ${colors.yellow} ${colors.underline}${wsUrl}${colors.reset}
${colors.magenta}●${colors.reset} ${colors.bold}Introspection${colors.reset}     ${colors.magenta}${process.env.NODE_ENV !== 'production' ? '✅ Enabled' : '🚫 Disabled'}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.dim}${colors.gray}💡 Press Ctrl+C to shutdown${colors.reset}

`);
};

export const catchBootstraps = (e: Error) => {
  console.error(`
${colors.bold}${colors.red}╔══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.red}║${colors.reset}  ${colors.bold}${colors.red}❌ FAILED TO START GRAPHQL SERVER ❌${colors.reset}        ${colors.bold}${colors.red}║${colors.reset}
${colors.bold}${colors.red}╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}${colors.red}Error Details:${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.red}●${colors.reset} ${colors.bold}Message:${colors.reset} ${colors.white}${e.message || e}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}
`);
};

/** Microservices Bootstrap */
export const microserviceBootstraps = (
  {
    serviceName,
    transport,
    host = 'localhost',
    port = undefined,
    mode = 'microservice',
  }: {
    serviceName: string;
    transport: 'TCP' | 'Redis' | 'NATS' | 'MQTT' | 'gRPC' | 'Kafka' | 'RMQ';
    host?: string;
    port?: number;
    mode?: 'microservice' | 'hybrid' | 'standalone';
  }
) => {
  console.log(`
${colors.bold}${colors.blue}╔══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.blue}║${colors.reset}  ${colors.bold}${colors.green}🔗 ${serviceName.toUpperCase()} MICROSERVICE CONNECTED ✅${colors.reset}     ${colors.bold}${colors.blue}║${colors.reset}
${colors.bold}${colors.blue}╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.bold}${colors.white}⚙️  SERVICE CONFIG${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.cyan}●${colors.reset} ${colors.bold}Service${colors.reset}              ${colors.green}${serviceName}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Transport${colors.reset}            ${colors.yellow}${transport}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Mode${colors.reset}                ${colors.magenta}${mode}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Status${colors.reset}              ${colors.green}✓ Connected${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Process ID${colors.reset}          ${colors.gray}${process.pid}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Started At${colors.reset}          ${colors.gray}${new Date().toLocaleString()}${colors.reset}
${port ? `${colors.cyan}●${colors.reset} ${colors.bold}Endpoint${colors.reset}             ${colors.blue}${host}:${port}${colors.reset}` : ''}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.dim}${colors.gray}✅ ${serviceName} is ready to receive requests via ${transport}${colors.reset}

`);
};

export const microserviceCatch = (
  {
    serviceName,
    transport,
    error,
  }: {
    serviceName: string;
    transport: string;
    error: Error;
  }
) => {
  console.error(`
${colors.bold}${colors.red}╔══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.red}║${colors.reset}  ${colors.bold}${colors.red}❌ ${serviceName.toUpperCase()} MICROSERVICE FAILED ❌${colors.reset}     ${colors.bold}${colors.red}║${colors.reset}
${colors.bold}${colors.red}╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}${colors.red}Error Details:${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}

${colors.red}●${colors.reset} ${colors.bold}Service${colors.reset}              ${colors.white}${serviceName}${colors.reset}
${colors.red}●${colors.reset} ${colors.bold}Transport${colors.reset}            ${colors.white}${transport}${colors.reset}
${colors.red}●${colors.reset} ${colors.bold}Message${colors.reset}             ${colors.white}${error.message || error}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────────${colors.reset}
`);
};
