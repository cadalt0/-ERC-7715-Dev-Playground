/**
 * Wraps Ethereum provider to add missing methods for viem compatibility
 */
export function wrapEthereumProvider(provider: any) {
  if (!provider) return provider;
  
  if (provider.addListener && provider.removeListener) {
    return provider;
  }
  
  return new Proxy(provider, {
    get(target, prop) {
      if (prop === 'addListener' && !target.addListener) {
        return target.on || (() => {});
      }
      if (prop === 'removeListener' && !target.removeListener) {
        return target.off || (() => {});
      }
      return target[prop as keyof typeof target];
    },
  });
}

