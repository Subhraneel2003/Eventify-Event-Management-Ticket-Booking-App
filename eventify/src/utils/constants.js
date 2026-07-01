import { Platform } from 'react-native';

const IS_EMULATOR = true;

export const API_BASE_URL = Platform.OS === 'android'
  ? IS_EMULATOR
    ? 'http://10.0.2.2:3000'          //  Android emulator 
    : 'http://192.168.29.254:3000'    //  Real Android device
  : 'http://localhost:3000';          //  iOS