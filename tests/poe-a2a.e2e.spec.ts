/**
 * PoE-A2A E2E Tests for Colosseum Hackathon
 * Verifies all /.well-known/ endpoints are functional
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://pdp-protocol-production.up.railway.app';

test.describe('PoE-A2A Live Endpoints', () => {

    test('Health endpoint returns OK status', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.status).toBe('ok');
        expect(data.nodeId).toBeDefined();
        expect(data.veracity).toBeGreaterThan(0);
    });

    test('AgentCard contains valid poe_extension', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/.well-known/agent-card.json`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.name).toBe('Berlin-Sovereign-Validator');
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

    test('Claims have valid timestamps (not expired)', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/.well-known/poe-claims.json`);
        const claims = await response.json();

        const now = Date.now();
        for (const claim of claims) {
            expect(claim.valid_until).toBeGreaterThan(now);
        }
    });
});
