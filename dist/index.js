"use strict";
/**
 * @openclaw/pdp
 * PoE Discovery Protocol — Trustless agent-to-agent discovery
 *
 * @license MIT
 * @author Berlin AI Labs
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticMatcher = exports.decodeVector = exports.encodeVector = exports.findMatchingPeers = exports.capabilitiesMatch = exports.cosineSimilarity = exports.generateEmbedding = exports.PDP_TOPICS = exports.GossipBeacon = void 0;
var GossipBeacon_1 = require("./GossipBeacon");
Object.defineProperty(exports, "GossipBeacon", { enumerable: true, get: function () { return GossipBeacon_1.GossipBeacon; } });
Object.defineProperty(exports, "PDP_TOPICS", { enumerable: true, get: function () { return GossipBeacon_1.PDP_TOPICS; } });
var SemanticMatcher_1 = require("./SemanticMatcher");
Object.defineProperty(exports, "generateEmbedding", { enumerable: true, get: function () { return SemanticMatcher_1.generateEmbedding; } });
Object.defineProperty(exports, "cosineSimilarity", { enumerable: true, get: function () { return SemanticMatcher_1.cosineSimilarity; } });
Object.defineProperty(exports, "capabilitiesMatch", { enumerable: true, get: function () { return SemanticMatcher_1.capabilitiesMatch; } });
Object.defineProperty(exports, "findMatchingPeers", { enumerable: true, get: function () { return SemanticMatcher_1.findMatchingPeers; } });
Object.defineProperty(exports, "encodeVector", { enumerable: true, get: function () { return SemanticMatcher_1.encodeVector; } });
Object.defineProperty(exports, "decodeVector", { enumerable: true, get: function () { return SemanticMatcher_1.decodeVector; } });
// Re-export for convenience
const GossipBeacon_2 = require("./GossipBeacon");
const SemanticMatcherNamespace = __importStar(require("./SemanticMatcher"));
exports.SemanticMatcher = SemanticMatcherNamespace;
exports.default = {
    GossipBeacon: GossipBeacon_2.GossipBeacon,
    SemanticMatcher: SemanticMatcherNamespace
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQXFFO0FBQTVELDRHQUFBLFlBQVksT0FBQTtBQUFhLDBHQUFBLFVBQVUsT0FBQTtBQUM1QyxxREFRMkI7QUFQdkIsb0hBQUEsaUJBQWlCLE9BQUE7QUFDakIsbUhBQUEsZ0JBQWdCLE9BQUE7QUFDaEIsb0hBQUEsaUJBQWlCLE9BQUE7QUFDakIsb0hBQUEsaUJBQWlCLE9BQUE7QUFDakIsK0dBQUEsWUFBWSxPQUFBO0FBQ1osK0dBQUEsWUFBWSxPQUFBO0FBSWhCLDRCQUE0QjtBQUM1QixpREFBOEM7QUFDOUMsNEVBQThEO0FBRWpELFFBQUEsZUFBZSxHQUFHLHdCQUF3QixDQUFDO0FBRXhELGtCQUFlO0lBQ1gsWUFBWSxFQUFaLDJCQUFZO0lBQ1osZUFBZSxFQUFFLHdCQUF3QjtDQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAb3BlbmNsYXcvcGRwXG4gKiBQb0UgRGlzY292ZXJ5IFByb3RvY29sIOKAlCBUcnVzdGxlc3MgYWdlbnQtdG8tYWdlbnQgZGlzY292ZXJ5XG4gKiBcbiAqIEBsaWNlbnNlIE1JVFxuICogQGF1dGhvciBCZXJsaW4gQUkgTGFic1xuICovXG5cbmV4cG9ydCB7IEdvc3NpcEJlYWNvbiwgUG9FQmVhY29uLCBQRFBfVE9QSUNTIH0gZnJvbSAnLi9Hb3NzaXBCZWFjb24nO1xuZXhwb3J0IHtcbiAgICBnZW5lcmF0ZUVtYmVkZGluZyxcbiAgICBjb3NpbmVTaW1pbGFyaXR5LFxuICAgIGNhcGFiaWxpdGllc01hdGNoLFxuICAgIGZpbmRNYXRjaGluZ1BlZXJzLFxuICAgIGVuY29kZVZlY3RvcixcbiAgICBkZWNvZGVWZWN0b3IsXG4gICAgQ2FwYWJpbGl0eVZlY3RvclxufSBmcm9tICcuL1NlbWFudGljTWF0Y2hlcic7XG5cbi8vIFJlLWV4cG9ydCBmb3IgY29udmVuaWVuY2VcbmltcG9ydCB7IEdvc3NpcEJlYWNvbiB9IGZyb20gJy4vR29zc2lwQmVhY29uJztcbmltcG9ydCAqIGFzIFNlbWFudGljTWF0Y2hlck5hbWVzcGFjZSBmcm9tICcuL1NlbWFudGljTWF0Y2hlcic7XG5cbmV4cG9ydCBjb25zdCBTZW1hbnRpY01hdGNoZXIgPSBTZW1hbnRpY01hdGNoZXJOYW1lc3BhY2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBHb3NzaXBCZWFjb24sXG4gICAgU2VtYW50aWNNYXRjaGVyOiBTZW1hbnRpY01hdGNoZXJOYW1lc3BhY2Vcbn07XG4iXX0=