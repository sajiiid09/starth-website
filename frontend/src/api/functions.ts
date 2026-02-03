import { base44 } from "./base44Client";

type Base44Function<TResponse = unknown> = (...args: unknown[]) => Promise<{ data: TResponse }>;
type Base44FunctionsMap = Record<string, Base44Function>;

const functions = (base44 as { functions: Base44FunctionsMap }).functions;

export const debugAuth = functions.debugAuth;
export const resetUserPassword = functions.resetUserPassword;
export const generateEventPlan = functions.generateEventPlan;
export const checkUserExists = functions.checkUserExists;
export const notifyVenueApproval = functions.notifyVenueApproval;
export const verifyPhoneOTP = functions.verifyPhoneOTP;
export const loginUser = functions.loginUser;
export const verifyEmail = functions.verifyEmail;
export const resetPassword = functions.resetPassword;
export const fixUserPassword = functions.fixUserPassword;
export const forgotPassword = functions.forgotPassword;
export const registerUser = functions.registerUser;
export const authRegister = functions.authRegister;
export const sendPhoneOTP = functions.sendPhoneOTP;
export const getGooglePlacePhotos = functions.getGooglePlacePhotos;
export const sharePlan = functions.sharePlan;
export const authLogin = functions.authLogin;
