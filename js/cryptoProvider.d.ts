import { CryptoUtils, ICryptoProvider } from './types';
/**
 * Wraps a CryptoUtils implementation object to return an object implementing ICryptoProvider
 * @param utils - crypto function implementations required to perform necessary crypto ops
 */
export declare const getCryptoProvider: (u: CryptoUtils) => ICryptoProvider;
