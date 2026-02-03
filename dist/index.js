"use strict";
/**
 * @openclaw/pdp
 * PoE Discovery Protocol — Trustless agent-to-agent discovery
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipBeacon = void 0;
__exportStar(require("./SovereignNode"), exports);
__exportStar(require("./discovery/GossipNode"), exports);
__exportStar(require("./blockchain/SolanaAdapter"), exports);
__exportStar(require("./zk/ZKProofGenerator"), exports);
__exportStar(require("./SemanticMatcher"), exports);
var GossipBeacon_1 = require("./GossipBeacon");
Object.defineProperty(exports, "GossipBeacon", { enumerable: true, get: function () { return GossipBeacon_1.GossipBeacon; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxrREFBZ0M7QUFDaEMseURBQXVDO0FBQ3ZDLDZEQUEyQztBQUMzQyx3REFBc0M7QUFDdEMsb0RBQWtDO0FBQ2xDLCtDQUE4QztBQUFyQyw0R0FBQSxZQUFZLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBvcGVuY2xhdy9wZHBcbiAqIFBvRSBEaXNjb3ZlcnkgUHJvdG9jb2wg4oCUIFRydXN0bGVzcyBhZ2VudC10by1hZ2VudCBkaXNjb3ZlcnlcbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL1NvdmVyZWlnbk5vZGUnO1xuZXhwb3J0ICogZnJvbSAnLi9kaXNjb3ZlcnkvR29zc2lwTm9kZSc7XG5leHBvcnQgKiBmcm9tICcuL2Jsb2NrY2hhaW4vU29sYW5hQWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL3prL1pLUHJvb2ZHZW5lcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9TZW1hbnRpY01hdGNoZXInO1xuZXhwb3J0IHsgR29zc2lwQmVhY29uIH0gZnJvbSAnLi9Hb3NzaXBCZWFjb24nO1xuIl19