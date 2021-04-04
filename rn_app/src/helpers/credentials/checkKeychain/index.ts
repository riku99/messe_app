import * as Keychain from 'react-native-keychain';

export type Credentials = {id: number; token: string};

export const checkKeychain = async () => {
  const credentials = await Keychain.getGenericPassword();
  const id = credentials && credentials.username;
  const token = credentials && credentials.password;
  if (id && token) {
    return {id: Number(id), token};
  } else {
    return;
  }
};