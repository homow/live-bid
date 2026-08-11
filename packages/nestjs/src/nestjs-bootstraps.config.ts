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
    baseUrl,
    swaggerUrl,
    port,
    apiVersion,
  }: {
    baseUrl: string;
    swaggerUrl: string;
    port: number | string;
    apiVersion: string | number;
  }
) => {
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.cyan}║${colors.reset}  ${colors.bold}${colors.green}✨ NESTJS APPLICATION STARTED SUCCESSFULLY ✨${colors.reset}      ${colors.bold}${colors.cyan}║${colors.reset}
${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.dim}${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.bold}${colors.white}📊 SYSTEM INFO${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}

${colors.cyan}●${colors.reset} ${colors.bold}Environment${colors.reset}         ${colors.green}${process.env.NODE_ENV || 'development'}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Process ID${colors.reset}           ${colors.yellow}${process.pid}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Node Version${colors.reset}         ${colors.magenta}${process.version}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Platform${colors.reset}             ${colors.blue}${process.platform}${colors.reset}
${colors.cyan}●${colors.reset} ${colors.bold}Started At${colors.reset}           ${colors.gray}${new Date().toLocaleString()}${colors.reset}

${colors.dim}${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.bold}${colors.green}✅ All endpoints are ready to serve${colors.reset}

${colors.bold}${colors.white}📍 ENDPOINTS${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}

${colors.green}●${colors.reset} ${colors.bold}Server Address${colors.reset}     ${colors.cyan}${colors.underline}http://localhost:${port}${colors.reset}
${colors.blue}●${colors.reset} ${colors.bold}API Base Path${colors.reset}      ${colors.blue}${colors.underline}${baseUrl}/v${apiVersion}${colors.reset}
${colors.yellow}●${colors.reset} ${colors.bold}Swagger JSON${colors.reset}       ${colors.yellow}${colors.underline}${baseUrl}/docs-json${colors.reset}
${colors.red}●${colors.reset} ${colors.bold}Swagger YAML${colors.reset}       ${colors.red}${colors.underline}${baseUrl}/docs-yaml${colors.reset}
${colors.magenta}●${colors.reset} ${colors.bold}Swagger UI${colors.reset}         ${colors.magenta}${colors.underline}${swaggerUrl}${colors.reset}

${colors.dim}${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.dim}${colors.gray}💡 Press Ctrl+C to shut down the server${colors.reset}

`);
};

export const catchBootstraps = (e: Error) => {
  console.error(`
${colors.bold}${colors.red}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.red}║${colors.reset}  ${colors.bold}${colors.red}❌ FAILED TO START NESTJS APPLICATION ❌${colors.reset}        ${colors.bold}${colors.red}║${colors.reset}
${colors.bold}${colors.red}╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}${colors.red}Error Details:${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}

${colors.red}●${colors.reset} ${colors.bold}Message:${colors.reset} ${colors.white}${e}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}
`);
};
