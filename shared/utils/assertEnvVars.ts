type EnvVars = Record<string, string | undefined>;

export const assertEnvVars = <T extends EnvVars>(vars: T): { [K in keyof T]: string } => {
  const missingVars = Object.entries(vars).filter(([_, value]) => !value);

  if (missingVars.length > 0) {
    const missingKeys = missingVars.map(([key]) => key).join(', ');
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }

  return vars as { [K in keyof T]: string };
};
