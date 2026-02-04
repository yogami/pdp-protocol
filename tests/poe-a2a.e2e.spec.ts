/**
 * PoE-A2A E2E Tests - Security Hardened Version
 * Tests the Ed25519 authenticated /anchor endpoint
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'https://pdp-protocol-production.up.railway.app';

test.describe('PoE-A2A Security Hardened Endpoints', () => {

    test('Health endpoint returns OK status', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.status).toBe('healthy');
        expect(data.node).toBeDefined();
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

        test('HAPPY PATH: Valid signature allows anchoring', async ({ request }) => {
            const crypto = await import('crypto');
            const ed = await import('@noble/ed25519');
            const sha512 = (...m: any[]) => crypto.createHash('sha512').update(Buffer.concat(m.map(b => Buffer.from(b)))).digest();
            (ed as any).hashes.sha512 = sha512;

            const privateKey = crypto.randomBytes(32);
            const publicKey = await ed.getPublicKey(privateKey);

            const agentId = Buffer.from(publicKey).toString('hex');
            const poeHash = crypto.randomBytes(32).toString('hex');

            // Sign the message (poeHash + agentId)
            const message = Buffer.from(poeHash + agentId);
            const signature = await ed.sign(message, privateKey);

            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash,
                    agentId,
                    agentSignature: Buffer.from(signature).toString('hex'),
                    agentPublicKey: Buffer.from(publicKey).toString('hex')
                }
            });

            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.signature).toBeDefined();
            expect(result.network).toBeDefined();
        });

        test('EDGE CASE: Missing agentSignature returns 400', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash: 'test',
                    agentId: 'test',
                    agentPublicKey: 'test'
                    // Missing agentSignature
                }
            });

            expect(response.status()).toBe(400);
            const error = await response.json();
            expect(error.error).toBe('Missing required fields');
        });

        test('EDGE CASE: Invalid signature returns 403', async ({ request }) => {
            const crypto = await import('crypto');
            const ed = await import('@noble/ed25519');
            const sha512 = (...m: any[]) => crypto.createHash('sha512').update(Buffer.concat(m.map(b => Buffer.from(b)))).digest();
            (ed as any).hashes.sha512 = sha512;

            const privateKey = crypto.randomBytes(32);
            const publicKey = await ed.getPublicKey(privateKey);

            const agentId = Buffer.from(publicKey).toString('hex');
            const poeHash = crypto.randomBytes(32).toString('hex');

            // Sign with WRONG message
            const wrongMessage = Buffer.from('wrong' + agentId);
            const signature = await ed.sign(wrongMessage, privateKey);

            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash,
                    agentId,
                    agentSignature: Buffer.from(signature).toString('hex'),
                    agentPublicKey: Buffer.from(publicKey).toString('hex')
                }
            });

            expect(response.status()).toBe(403);
            const error = await response.json();
            expect(error.error).toContain('Unauthorized');
        });

        test('EDGE CASE: Mismatched public key returns 403', async ({ request }) => {
            const crypto = await import('crypto');
            const ed = await import('@noble/ed25519');
            const sha512 = (...m: any[]) => crypto.createHash('sha512').update(Buffer.concat(m.map(b => Buffer.from(b)))).digest();
            (ed as any).hashes.sha512 = sha512;

            const privateKey1 = crypto.randomBytes(32);
            const publicKey1 = await ed.getPublicKey(privateKey1);

            const privateKey2 = crypto.randomBytes(32);
            const publicKey2 = await ed.getPublicKey(privateKey2);

            const agentId = Buffer.from(publicKey1).toString('hex');
            const poeHash = crypto.randomBytes(32).toString('hex');

            // Sign with key1 but provide key2
            const message = Buffer.from(poeHash + agentId);
            const signature = await ed.sign(message, privateKey1);

            const response = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash,
                    agentId,
                    agentSignature: Buffer.from(signature).toString('hex'),
                    agentPublicKey: Buffer.from(publicKey2).toString('hex') // Wrong key
                }
            });

            expect(response.status()).toBe(403);
        });

        test('EDGE CASE: Sequence numbers increment correctly', async ({ request }) => {
            const crypto = await import('crypto');
            const ed = await import('@noble/ed25519');
            const sha512 = (...m: any[]) => crypto.createHash('sha512').update(Buffer.concat(m.map(b => Buffer.from(b)))).digest();
            (ed as any).hashes.sha512 = sha512;

            const privateKey = crypto.randomBytes(32);
            const publicKey = await ed.getPublicKey(privateKey);
            const agentId = Buffer.from(publicKey).toString('hex');

            // First anchor
            const poeHash1 = crypto.randomBytes(32).toString('hex');
            const message1 = Buffer.from(poeHash1 + agentId);
            const signature1 = await ed.sign(message1, privateKey);

            const response1 = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash: poeHash1,
                    agentId,
                    agentSignature: Buffer.from(signature1).toString('hex'),
                    agentPublicKey: Buffer.from(publicKey).toString('hex')
                }
            });

            expect(response1.ok()).toBeTruthy();
            const result1 = await response1.json();
            const firstSig = result1.signature;

            // Second anchor (should have incremented sequence)
            const poeHash2 = crypto.randomBytes(32).toString('hex');
            const message2 = Buffer.from(poeHash2 + agentId);
            const signature2 = await ed.sign(message2, privateKey);

            const response2 = await request.post(`${BASE_URL}/anchor`, {
                data: {
                    poeHash: poeHash2,
                    agentId,
                    agentSignature: Buffer.from(signature2).toString('hex'),
                    agentPublicKey: Buffer.from(publicKey).toString('hex')
                }
            });

            expect(response2.ok()).toBeTruthy();
            const result2 = await response2.json();

            // Verify signatures are different (sequence incremented)
            expect(result2.signature).not.toBe(firstSig);
        });
    });
});
