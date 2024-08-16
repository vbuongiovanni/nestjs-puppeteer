export const appConfig = () => {
  return {
    SBR_WS_ENDPOINT: process.env.SBR_WS_ENDPOINT,
    CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH,
    NODE_ENV: process.env.NODE_ENV,
    puppeteerConfig:
      process.env.NODE_ENV === 'development'
        ? {
            executablePath: process.env.CHROME_EXECUTABLE_PATH,
          }
        : {
            browserWSEndpoint: process.env.SBR_WS_ENDPOINT,
          },
  };
};
