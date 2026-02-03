import { getNetConfig, isNetworkAddress } from '@libp2p/utils';
export function multiaddrToIPStr(multiaddr) {
    if (isNetworkAddress(multiaddr)) {
        const config = getNetConfig(multiaddr);
        switch (config.type) {
            case 'ip4':
            case 'ip6':
                return config.host;
            default:
                break;
        }
    }
    return null;
}
//# sourceMappingURL=multiaddr.js.map