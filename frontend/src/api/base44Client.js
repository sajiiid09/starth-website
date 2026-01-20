import { createMockClient } from './mockBase44Client';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// export const base44 = createClient({
//   appId: "694725e6777e391542fd8499", 
//   requiresAuth: true // Ensure authentication is required for all operations
// });

export const base44 = createMockClient({
    appId: "mock-app-id",
    requiresAuth: false
});
