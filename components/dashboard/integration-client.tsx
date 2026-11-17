'use client';

import { useState } from 'react';
import {
    createApiKeyAction,
    revokeApiKeyAction,
    createWebhookAction,
    deleteWebhookAction,
    sendClientEmailAction,
} from '@/lib/integration-actions';

interface ApiKeyItem {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    createdByName: string | null;
}

interface WebhookItem {
    id: string;
    url: string;
    events: string;
    secret: string;
    status: string;
    createdAt: Date;
}

interface PackOption {
    id: string;
    title: string;
    propertyTitle: string;
}

interface IntegrationsClientProps {
    orgId: string;
    apiKeys: ApiKeyItem[];
    webhooks: WebhookItem[];
    packs: PackOption[];
    isOwner: boolean;
    isAdmin: boolean;
}

export function IntegrationsClient({
    orgId,
    apiKeys,
    webhooks,
    packs,
    isOwner,
    isAdmin,
}: IntegrationsClientProps) {
    const [activeTab, setActiveTab] = useState<'api' | 'webhooks' | 'email'>('api');
    const [emailSent, setEmailSent] = useState(false);

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('api')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'api'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>🔑</span>
                    <span>API Keys</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('webhooks')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'webhooks'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>🔌</span>
                    <span>Webhooks & CRM</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('email')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'email'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>✉️</span>
                    <span>Direct Client Email</span>
                </button>
            </div>

            {/* TAB 1: API KEYS */}
            {activeTab === 'api' && (
                <div className="space-y-6">
                    {/* Create API Key Card */}
                    {isOwner && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-1">Create Agency API Key</h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Generate secret API keys to programmatically generate marketing packs from external CRM or MLS tools.
                            </p>

                            <form action={createApiKeyAction} className="flex flex-col sm:flex-row gap-3">
                                <input type="hidden" name="orgId" value={orgId} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Website Integration, Zapier Sync, Mobile App"
                                    className="flex-1 text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                                >
                                    + Generate Key
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Active Keys List */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold text-gray-900">Active API Keys ({apiKeys.length})</h2>

                        {apiKeys.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4">
                                No API keys generated yet. Create one above to get started with API integrations.
                            </p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {apiKeys.map((key) => (
                                    <div key={key.id} className="py-3.5 flex items-center justify-between text-xs">
                                        <div>
                                            <div className="font-semibold text-gray-900">{key.name}</div>
                                            <div className="font-mono text-gray-500 text-[11px] mt-0.5">{key.keyPrefix}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                Created {new Date(key.createdAt).toLocaleDateString()}
                                                {key.createdByName && ` by ${key.createdByName}`} &bull;{' '}
                                                {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <form action={revokeApiKeyAction}>
                                                <input type="hidden" name="orgId" value={orgId} />
                                                <input type="hidden" name="keyId" value={key.id} />
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-lg transition-colors font-medium"
                                                >
                                                    Revoke
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Developer API Documentation Snippet */}
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-6 shadow-sm space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
                            <span className="font-bold text-gray-200">REST API Example: Generate Marketing Pack</span>
                            <span>POST /api/v1/packs/generate</span>
                        </div>
                        <pre className="text-gray-300 overflow-x-auto leading-relaxed">
                            {`curl -X POST https://api.propertyai.com/v1/packs \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "c3b7a810-7294-4d83-b248-18e390c2834b",
    "templateId": "luxury-estate",
    "tone": "luxury"
  }'`}
                        </pre>
                    </div>
                </div>
            )}

            {/* TAB 2: WEBHOOKS & CRM */}
            {activeTab === 'webhooks' && (
                <div className="space-y-6">
                    {/* Create Webhook */}
                    {isAdmin && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-gray-900">Add Webhook Endpoint</h2>
                            <p className="text-xs text-gray-500">
                                Receive real-time HTTP notifications whenever marketing packs are approved, generated, or published.
                            </p>

                            <form action={createWebhookAction} className="space-y-4">
                                <input type="hidden" name="orgId" value={orgId} />

                                <div>
                                    <label htmlFor="url" className="block text-xs font-semibold text-gray-700 mb-1">
                                        Payload URL
                                    </label>
                                    <input
                                        type="url"
                                        id="url"
                                        name="url"
                                        required
                                        placeholder="https://agency.com/api/webhooks/propertyai"
                                        className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <span className="block text-xs font-semibold text-gray-700 mb-2">Subscribe to Events</span>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" name="events" value="pack.published" defaultChecked className="rounded" />
                                            <span>pack.published</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" name="events" value="pack.approved" defaultChecked className="rounded" />
                                            <span>pack.approved</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" name="events" value="property.created" defaultChecked className="rounded" />
                                            <span>property.created</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                    >
                                        + Register Webhook
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Active Webhooks */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold text-gray-900">Registered Endpoints ({webhooks.length})</h2>

                        {webhooks.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4">No webhook endpoints configured yet.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {webhooks.map((wh) => (
                                    <div key={wh.id} className="py-3.5 flex items-center justify-between text-xs">
                                        <div>
                                            <div className="font-mono text-gray-900 font-semibold">{wh.url}</div>
                                            <div className="text-[11px] text-gray-500 mt-1">
                                                Events: <span className="text-blue-600">{wh.events}</span> &bull; Secret: <span className="font-mono">{wh.secret.slice(0, 10)}...</span>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <form action={deleteWebhookAction}>
                                                <input type="hidden" name="orgId" value={orgId} />
                                                <input type="hidden" name="webhookId" value={wh.id} />
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-lg transition-colors font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Connected CRM Platforms */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🟧</span>
                                <div>
                                    <div className="font-bold text-xs text-gray-900">HubSpot Real Estate CRM</div>
                                    <div className="text-[11px] text-gray-500">Sync listing contacts and marketing packs</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => alert('Connect your HubSpot account via OAuth')}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Connect
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <div className="font-bold text-xs text-gray-900">Zapier Automation</div>
                                    <div className="text-[11px] text-gray-500">Connect to 5,000+ real estate apps</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => alert('Connect Zapier webhook trigger')}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: DIRECT CLIENT EMAIL DISPATCH */}
            {activeTab === 'email' && (
                <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Direct Client Delivery</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Email high-resolution, branded PDF marketing packs directly to prospective buyers and client leads.
                        </p>
                    </div>

                    {emailSent && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                            ✓ Email successfully dispatched to client!
                        </div>
                    )}

                    <form
                        action={async (formData) => {
                            await sendClientEmailAction(formData);
                            setEmailSent(true);
                            setTimeout(() => setEmailSent(false), 4000);
                        }}
                        className="space-y-4"
                    >
                        <input type="hidden" name="orgId" value={orgId} />

                        <div>
                            <label htmlFor="recipientEmail" className="block text-xs font-semibold text-gray-700 mb-1">
                                Recipient Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="recipientEmail"
                                name="recipientEmail"
                                required
                                placeholder="buyer@clientdomain.com"
                                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="packId" className="block text-xs font-semibold text-gray-700 mb-1">
                                Select Marketing Pack <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="packId"
                                name="packId"
                                required
                                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none bg-white"
                            >
                                {packs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} ({p.propertyTitle})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 mb-1">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                defaultValue="Exclusive Real Estate Presentation & Specifications"
                                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-xs font-semibold text-gray-700 mb-1">
                                Personal Message to Buyer
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={3}
                                placeholder="Dear client, please review the attached property flyer for your upcoming weekend tour..."
                                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                            >
                                <span>✉️</span>
                                <span>Send Branded PDF to Client &rarr;</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
