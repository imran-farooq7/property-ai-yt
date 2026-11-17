import { requireTenant } from '@/lib/tenant';
import { getBrandKit } from '@/lib/pdf/branding';
import { getProperties } from '@/lib/properties';
import { canManageTeam } from '@/lib/permissions';
import { TemplateEditorClient } from '@/components/branding/template-editor-client';
import { UserRole } from '@/types';

export default async function TemplateEditorPage() {
  const tenant = await requireTenant();
  const canEdit = canManageTeam(tenant.role as UserRole);

  const [brandKit, properties] = await Promise.all([
    getBrandKit(tenant.org.id),
    getProperties(tenant.org.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brand Kit & Template Studio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your real estate agency branding and preview PDF marketing templates in real-time for{' '}
          <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
        </p>
      </div>

      {/* Interactive Studio Workbench */}
      <TemplateEditorClient
        orgId={tenant.org.id}
        orgName={tenant.org.name}
        brandKit={{
          name: brandKit.name,
          logo: brandKit.logo,
          primaryColor: brandKit.primaryColor,
          secondaryColor: brandKit.secondaryColor,
          accentColor: brandKit.accentColor,
          fontFamily: brandKit.fontFamily,
          tagline: brandKit.tagline,
          disclaimer: brandKit.disclaimer,
        }}
        properties={properties.map((p) => ({
          id: p.id,
          title: p.title,
          address: p.address,
          city: p.city,
          state: p.state,
          price: p.price,
          currency: p.currency,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          propertyType: p.propertyType,
          heroImage: p.heroImage,
          description: p.description,
        }))}
        canEdit={canEdit}
      />
    </div>
  );
}
