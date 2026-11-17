import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extends app.json with values that come from .env (see supabase/README.md).
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
  return {
    ...config,
    name: config.name ?? 'Ritmo',
    slug: config.slug ?? 'ritmo',
    plugins: [
      ...(config.plugins ?? []),
      // Android needs no plugin options; iOS needs the reversed client ID
      // as a URL scheme so Google can return to the app.
      ...(iosUrlScheme
        ? [
            ['@react-native-google-signin/google-signin', { iosUrlScheme }] as [
              string,
              { iosUrlScheme: string },
            ],
          ]
        : []),
    ],
  };
};
