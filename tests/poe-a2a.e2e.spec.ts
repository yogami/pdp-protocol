/**
 * PoE-A2A E2E Tests - Veracity Core Production
 * Tests the live production deployment
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://pdp-protocol-production.up.railway.app';

test.describe('PoE-A2A Production Endpoints', () => {

    test('Health endpoint returns OK status', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(['ok', 'healthy']).toContain(data.status);
        expect(data.nodeId || data.node).toBeDefined();
    });

    test('AgentCard contains valid poe_extension', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/.well-known/agent-card.json`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.name).toBeDefined();
        expect(data.protocol_version).toBe('A2A/1.0');
        expect(data.poe_extension).toBeDefined();
        expect(data.poe_extension.version).toBe('PoE-A2A/1.0');
        expect(data.poe_extension.signing_key).toContain('ed25519:');
        expect(data.poe_extension.claims_endpoint).toBe('/.well-known/poe-claims.json');
    });

    test('PoE Claims endpoint returns valid claims array', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/.well-known/poe-claims.json`);
        expect(response.ok()).toBeTruthy();

        const claims = await response.json();
        expect(Array.isArray(claims)).toBeTruthy();
        expect(claims.length).toBeGreaterThan(0);

        const claim = claims[0];
        expect(claim.id).toBeDefined();
        expect(claim.key_id).toBeDefined();
        expect(claim.task_hash).toContain('sha256:');
        expect(claim.output_hash).toContain('sha256:');
        expect(claim.timestamp).toBeGreaterThan(0);
        expect(claim.valid_until).toBeGreaterThan(claim.timestamp);
        expect(claim.signature).toContain('ed25519:');
    });

    test('PoE Badge returns valid SVG', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/.well-known/poe-badge.svg`);
        expect(response.ok()).toBeTruthy();

        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image/svg+xml');

        const svg = await response.text();
        expect(svg).toContain('<svg');
        expect(svg).toContain('PoE');
    });

    test.describe('/anchor endpoint - Security Tests', () => {

        test('Anchor endpoint requires authentication fields', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash: 'test',
                    agentId: 'test'
                    // Missing agentSignature and agentPublicKey
                }
            });

            expect(response.status()).toBe(400);
            const error = await response.json();
            expect(error.error).toBe('Missing required fields');
            expect(error.required).toContain('agentSignature');
            expect(error.required).toContain('agentPublicKey');
        });

        test('Invalid signature returns 403 Unauthorized', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash: 'test-hash',
                    agentId: 'test-agent',
                    agentSignature: 'invalid-signature',
                    agentPublicKey: 'invalid-key'
                }
            });

            expect(response.status()).toBe(403);
            const error = await response.json();
            expect(error.error).toContain('Unauthorized');
        });
    });
});
