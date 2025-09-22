import { AirService, BUILD_ENV } from "@mocanetwork/airkit";

let airService: AirService | null = null;

export const getAirService = async (): Promise<AirService> => {
  if (!airService) {
    const partnerId = process.env.NEXT_PUBLIC_MOCA_PARTNER_ID;

    if (!partnerId) {
      throw new Error("NEXT_PUBLIC_MOCA_PARTNER_ID is not set. Please configure your environment variables.");
    }

    airService = new AirService({
      partnerId: partnerId
    });

    await airService.init({
      buildEnv: process.env.NEXT_PUBLIC_MOCA_BUILD_ENV === 'production' ? BUILD_ENV.PRODUCTION : BUILD_ENV.SANDBOX,
      enableLogging: process.env.NODE_ENV === 'development'
    });
  }

  return airService;
};

export const resetAirService = () => {
  airService = null;
};

export { BUILD_ENV };