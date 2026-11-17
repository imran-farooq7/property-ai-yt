export interface TemplatePropertyData {
    title: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    sqft?: number | null;
    lotSize?: number | null;
    yearBuilt?: number | null;
    propertyType: string;
    heroImage?: string | null;
    amenities?: string[];
    description?: string | null;
    bullets?: string[];
    headline?: string | null;
}

export interface TemplateBrandKit {
    name?: string;
    logo?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    fontFamily?: string | null;
    tagline?: string | null;
    disclaimer?: string | null;
    agencyPhone?: string | null;
    agencyWebsite?: string | null;
}

export interface TemplateDefinition {
    id: string;
    name: string;
    category: 'Modern' | 'Luxury' | 'Suburban' | 'Urban';
    description: string;
    previewThumbnail: string;
    render: (property: TemplatePropertyData, brand: TemplateBrandKit) => string;
}

const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
};

// 1. Template: Modern Minimalist Flyer
function renderModernMinimal(property: TemplatePropertyData, brand: TemplateBrandKit): string {
    const primary = brand.primaryColor || '#2563EB';
    const secondary = brand.secondaryColor || '#1E40AF';
    const font = brand.fontFamily || 'Inter, sans-serif';
    const sym = currencySymbols[property.currency] || '$';
    const formattedPrice = `${sym}${property.price.toLocaleString()}`;

    const bulletsHtml = property.bullets && property.bullets.length > 0
        ? property.bullets.map((b) => `<li style="padding: 4px 0; color: #4B5563; font-size: 11px;">${b}</li>`).join('')
        : (property.amenities || []).map((a) => `<li style="padding: 4px 0; color: #4B5563; font-size: 11px;">• ${a}</li>`).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { font-family: ${font}; width: 210mm; min-height: 297mm; color: #1F2937; background: #FFFFFF; }
    .header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${primary}; }
    .agency-name { font-size: 18px; font-weight: 800; color: ${secondary}; text-transform: uppercase; letter-spacing: 1px; }
    .agency-tagline { font-size: 10px; color: #6B7280; margin-top: 2px; }
    .hero { width: 100%; height: 115mm; position: relative; background: #F3F4F6; }
    .hero img { width: 100%; height: 100%; object-fit: cover; }
    .price-badge { position: absolute; bottom: 20px; right: 32px; background: ${primary}; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .specs-bar { display: flex; background: #F9FAFB; padding: 16px 32px; border-bottom: 1px solid #E5E7EB; justify-content: space-around; }
    .spec-item { text-align: center; }
    .spec-val { font-size: 16px; font-weight: 700; color: #111827; }
    .spec-lbl { font-size: 10px; color: #6B7280; text-transform: uppercase; margin-top: 2px; }
    .content { padding: 24px 32px; display: flex; gap: 24px; }
    .col-left { flex: 3; }
    .col-right { flex: 2; }
    .title { font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 4px; }
    .address { font-size: 12px; color: #4B5563; margin-bottom: 14px; }
    .description { font-size: 11.5px; line-height: 1.6; color: #374151; white-space: pre-wrap; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${primary}; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 10px; }
    .bullets { list-style: none; }
    .footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 32px; background: #111827; color: #F9FAFB; display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
    .footer-left { max-width: 60%; }
    .disclaimer { font-size: 8px; color: #9CA3AF; margin-top: 4px; line-height: 1.3; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="agency-name">${brand.name || 'PropertyAI Real Estate'}</div>
      <div class="agency-tagline">${brand.tagline || 'Excellence in Residential Marketing'}</div>
    </div>
    ${brand.logo ? `<img src="${brand.logo}" style="height: 36px; object-fit: contain;">` : ''}
  </div>

  <div class="hero">
    ${property.heroImage ? `<img src="${property.heroImage}">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:24px;">Property Photo</div>'}
    <div class="price-badge">${formattedPrice}</div>
  </div>

  <div class="specs-bar">
    <div class="spec-item"><div class="spec-val">${property.bedrooms}</div><div class="spec-lbl">Bedrooms</div></div>
    <div class="spec-item"><div class="spec-val">${property.bathrooms}</div><div class="spec-lbl">Bathrooms</div></div>
    <div class="spec-item"><div class="spec-val">${property.sqft ? property.sqft.toLocaleString() : 'N/A'}</div><div class="spec-lbl">Living Sqft</div></div>
    <div class="spec-item"><div class="spec-val">${property.yearBuilt || 'N/A'}</div><div class="spec-lbl">Year Built</div></div>
    <div class="spec-item"><div class="spec-val" style="text-transform:capitalize;">${property.propertyType}</div><div class="spec-lbl">Property Type</div></div>
  </div>

  <div class="content">
    <div class="col-left">
      <div class="title">${property.title}</div>
      <div class="address">📍 ${property.address}, ${property.city}, ${property.state} ${property.zipCode || ''}</div>
      <div class="description">${property.description || 'Welcome to this exceptional property offering exquisite design, generous proportions, and unmatched comfort.'}</div>
    </div>
    <div class="col-right">
      <div class="section-title">Key Highlights</div>
      <ul class="bullets">
        ${bulletsHtml}
      </ul>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <div>Presented by ${brand.name || 'PropertyAI Agency'} &bull; ${brand.agencyPhone || '+1 (555) 019-2834'}</div>
      <div class="disclaimer">${brand.disclaimer || 'Information deemed reliable but not guaranteed. All dimensions are approximate.'}</div>
    </div>
    <div>${brand.agencyWebsite || 'www.propertyai.com'}</div>
  </div>
</body>
</html>`;
}

// 2. Template: Luxury Elegance Brochure
function renderLuxuryEstate(property: TemplatePropertyData, brand: TemplateBrandKit): string {
    const accent = brand.accentColor || '#D97706';
    const sym = currencySymbols[property.currency] || '$';
    const formattedPrice = `${sym}${property.price.toLocaleString()}`;

    const bulletsHtml = (property.amenities || [])
        .slice(0, 6)
        .map((a) => `<div style="padding: 6px 10px; background: #1E293B; border-radius: 4px; font-size: 10px; color: #E2E8F0; border-left: 2px solid ${accent};">${a}</div>`)
        .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { font-family: 'Playfair Display', Georgia, serif; width: 210mm; min-height: 297mm; color: #F8FAFC; background: #0F172A; }
    .header { padding: 32px 36px 16px 36px; text-align: center; border-bottom: 1px solid #334155; }
    .pre-header { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: ${accent}; font-family: sans-serif; font-weight: 600; }
    .agency-name { font-size: 22px; font-weight: 700; letter-spacing: 1px; color: #FFFFFF; margin-top: 4px; }
    .hero-container { padding: 24px 36px; }
    .hero-frame { width: 100%; height: 110mm; border: 1px solid #334155; padding: 6px; background: #1E293B; }
    .hero-frame img { width: 100%; height: 100%; object-fit: cover; }
    .property-header { padding: 0 36px; display: flex; justify-content: space-between; align-items: flex-end; }
    .prop-title { font-size: 22px; font-weight: 700; color: #FFFFFF; max-width: 65%; line-height: 1.2; }
    .prop-price { font-size: 26px; font-weight: 700; color: ${accent}; font-family: sans-serif; }
    .prop-address { font-size: 11px; color: #94A3B8; font-family: sans-serif; letter-spacing: 0.5px; margin-top: 4px; }
    .specs-grid { margin: 18px 36px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid #334155; border-bottom: 1px solid #334155; padding: 12px 0; }
    .spec-box { text-align: center; font-family: sans-serif; }
    .spec-num { font-size: 15px; font-weight: 700; color: #F8FAFC; }
    .spec-name { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-top: 2px; }
    .body-section { padding: 0 36px; display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
    .narrative { font-size: 11px; line-height: 1.7; color: #CBD5E1; font-family: sans-serif; }
    .features-list { display: flex; flex-direction: column; gap: 6px; }
    .footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 36px; border-top: 1px solid #334155; background: #0B1120; font-family: sans-serif; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="pre-header">PRESTIGE RESIDENTIAL COLLECTION</div>
    <div class="agency-name">${brand.name || 'SOTHEBY’S LUXURY PORTFOLIO'}</div>
  </div>

  <div class="hero-container">
    <div class="hero-frame">
      ${property.heroImage ? `<img src="${property.heroImage}">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#64748B;">Luxury Estate Image</div>'}
    </div>
  </div>

  <div class="property-header">
    <div>
      <div class="prop-title">${property.title}</div>
      <div class="prop-address">📍 ${property.address}, ${property.city}, ${property.state}</div>
    </div>
    <div class="prop-price">${formattedPrice}</div>
  </div>

  <div class="specs-grid">
    <div class="spec-box"><div class="spec-num">${property.bedrooms}</div><div class="spec-name">Bedrooms</div></div>
    <div class="spec-box"><div class="spec-num">${property.bathrooms}</div><div class="spec-name">Bathrooms</div></div>
    <div class="spec-box"><div class="spec-num">${property.sqft ? property.sqft.toLocaleString() + ' SQFT' : 'N/A'}</div><div class="spec-name">Interior Space</div></div>
    <div class="spec-box"><div class="spec-num">${property.yearBuilt || 'Renovated'}</div><div class="spec-name">Year Built</div></div>
  </div>

  <div class="body-section">
    <div class="narrative">
      ${property.description || 'An extraordinary achievement in design and refinement. Crafted for those who appreciate architectural purity, bespoke finishes, and a private sanctuary of unmatched quality.'}
    </div>
    <div class="features-list">
      ${bulletsHtml}
    </div>
  </div>

  <div class="footer">
    <div>Confidential Inquiries &bull; ${brand.name || 'Private Client Group'}</div>
    <div>${brand.agencyWebsite || 'www.luxuryproperties.com'}</div>
  </div>
</body>
</html>`;
}

// 3. Template: Suburban Family Feature Sheet
function renderFamilyHome(property: TemplatePropertyData, brand: TemplateBrandKit): string {
    const primary = brand.primaryColor || '#059669';
    const sym = currencySymbols[property.currency] || '$';
    const formattedPrice = `${sym}${property.price.toLocaleString()}`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; width: 210mm; min-height: 297mm; background: #FFFFFF; color: #1E293B; }
    .top-strip { background: ${primary}; color: #FFFFFF; padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600; }
    .hero-wrap { position: relative; width: 100%; height: 110mm; background: #E2E8F0; }
    .hero-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .badge-card { position: absolute; bottom: 20px; left: 32px; background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); padding: 16px 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border-left: 6px solid ${primary}; }
    .badge-title { font-size: 18px; font-weight: 800; color: #0F172A; }
    .badge-price { font-size: 22px; font-weight: 800; color: ${primary}; margin-top: 2px; }
    .specs-row { display: grid; grid-template-columns: repeat(4, 1fr); margin: 20px 32px; gap: 12px; }
    .spec-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; text-align: center; }
    .spec-card .val { font-size: 16px; font-weight: 700; color: #0F172A; }
    .spec-card .lbl { font-size: 10px; color: #64748B; text-transform: uppercase; margin-top: 2px; }
    .main-body { padding: 0 32px; display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
    .sub-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: ${primary}; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
    .desc-text { font-size: 11px; line-height: 1.65; color: #334155; }
    .amenity-chip { display: inline-block; background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; font-size: 10px; padding: 4px 8px; border-radius: 6px; margin: 3px; font-weight: 500; }
    .footer { position: absolute; bottom: 0; left: 0; right: 0; background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B; }
  </style>
</head>
<body>
  <div class="top-strip">
    <div>${brand.name || 'Hometown Properties'} &bull; WELCOME HOME</div>
    <div>${brand.agencyPhone || '+1 (555) 789-0123'}</div>
  </div>

  <div class="hero-wrap">
    ${property.heroImage ? `<img src="${property.heroImage}">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#64748B;">Home Photo</div>'}
    <div class="badge-card">
      <div class="badge-title">${property.title}</div>
      <div style="font-size:11px;color:#64748B;margin-top:2px;">${property.address}, ${property.city}</div>
      <div class="badge-price">${formattedPrice}</div>
    </div>
  </div>

  <div class="specs-row">
    <div class="spec-card"><div class="val">${property.bedrooms} Beds</div><div class="lbl">Accommodations</div></div>
    <div class="spec-card"><div class="val">${property.bathrooms} Baths</div><div class="lbl">Bathrooms</div></div>
    <div class="spec-card"><div class="val">${property.sqft ? property.sqft.toLocaleString() : 'N/A'}</div><div class="lbl">Square Feet</div></div>
    <div class="spec-card"><div class="val">${property.lotSize ? property.lotSize + ' ac' : 'Suburban'}</div><div class="lbl">Lot Size</div></div>
  </div>

  <div class="main-body">
    <div>
      <div class="sub-title">Home Overview</div>
      <div class="desc-text">${property.description || 'Step into the ideal family home. Generous living zones, a sunlit modern kitchen, and a private fenced backyard made for weekend barbecues and relaxing evenings.'}</div>
    </div>
    <div>
      <div class="sub-title">Property Highlights</div>
      <div>
        ${(property.amenities || ['Attached Garage', 'Private Garden', 'Central A/C', 'Top School District', 'Updated Kitchen']).map((a) => `<span class="amenity-chip">✓ ${a}</span>`).join('')}
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Presented by ${brand.name || 'PropertyAI'} &bull; All details reliable but unverified.</div>
    <div>${brand.agencyWebsite || 'www.hometowngroup.com'}</div>
  </div>
</body>
</html>`;
}

// 4. Template: Urban High-Rise Showcase
function renderUrbanShowcase(property: TemplatePropertyData, brand: TemplateBrandKit): string {
    const primary = brand.primaryColor || '#7C3AED';
    const sym = currencySymbols[property.currency] || '$';
    const formattedPrice = `${sym}${property.price.toLocaleString()}`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; width: 210mm; min-height: 297mm; background: #FAFAFA; color: #18181B; }
    .hero-banner { width: 100%; height: 120mm; position: relative; background: #27272A; }
    .hero-banner img { width: 100%; height: 100%; object-fit: cover; }
    .banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 28px 32px; color: #FFFFFF; }
    .banner-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #A78BFA; }
    .banner-title { font-size: 24px; font-weight: 800; margin-top: 4px; }
    .banner-price { font-size: 26px; font-weight: 800; color: #34D399; margin-top: 4px; }
    .grid-container { padding: 24px 32px; display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .spec-strip { display: flex; gap: 12px; margin-bottom: 20px; }
    .spec-pill { background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 8px; padding: 8px 16px; text-align: center; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .spec-pill .v { font-size: 15px; font-weight: 700; color: #18181B; }
    .spec-pill .l { font-size: 9px; color: #71717A; text-transform: uppercase; margin-top: 2px; }
    .desc { font-size: 11px; line-height: 1.7; color: #3F3F46; }
    .side-card { background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .side-heading { font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${primary}; margin-bottom: 12px; border-bottom: 1px solid #F4F4F5; padding-bottom: 6px; }
    .feature-item { font-size: 11px; color: #52525B; padding: 4px 0; display: flex; align-items: center; gap: 6px; }
    .footer { position: absolute; bottom: 0; left: 0; right: 0; background: #18181B; color: #A1A1AA; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
  </style>
</head>
<body>
  <div class="hero-banner">
    ${property.heroImage ? `<img src="${property.heroImage}">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#A1A1AA;">City View</div>'}
    <div class="banner-overlay">
      <div class="banner-tag">EXCLUSIVE URBAN RESIDENCE</div>
      <div class="banner-title">${property.title}</div>
      <div style="font-size:12px;color:#D4D4D8;margin-top:2px;">📍 ${property.address}, ${property.city}</div>
      <div class="banner-price">${formattedPrice}</div>
    </div>
  </div>

  <div class="grid-container">
    <div>
      <div class="spec-strip">
        <div class="spec-pill"><div class="v">${property.bedrooms}</div><div class="l">Beds</div></div>
        <div class="spec-pill"><div class="v">${property.bathrooms}</div><div class="l">Baths</div></div>
        <div class="spec-pill"><div class="v">${property.sqft ? property.sqft.toLocaleString() : 'N/A'}</div><div class="l">Sqft</div></div>
        <div class="spec-pill"><div class="v" style="text-transform:capitalize;">${property.propertyType}</div><div class="l">Type</div></div>
      </div>
      <div class="desc">${property.description || 'Experience premier skyline living. Sweeping floor-to-ceiling vistas, refined contemporary finishes, concierge amenities, and unmatched proximity to downtown culture and commerce.'}</div>
    </div>
    <div>
      <div class="side-card">
        <div class="side-heading">Amenities</div>
        ${(property.amenities || ['Skyline Balcony', 'Concierge & Security', 'Fitness Center', 'Secure Parking', 'Smart Home Tech']).map((a) => `<div class="feature-item"><span style="color:${primary};">✦</span><span>${a}</span></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Brokered by ${brand.name || 'Metropolitan Realty Group'}</div>
    <div>${brand.agencyWebsite || 'www.urbanliving.com'}</div>
  </div>
</body>
</html>`;
}

// Registry of built-in templates
export const TEMPLATES: TemplateDefinition[] = [
    {
        id: 'modern-minimal',
        name: 'Modern Minimalist',
        category: 'Modern',
        description: 'Clean, contemporary A4 flyer with bold price badge, specs grid, and 2-column description.',
        previewThumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
        render: renderModernMinimal,
    },
    {
        id: 'luxury-estate',
        name: 'Luxury Estate Portfolio',
        category: 'Luxury',
        description: 'Opulent dark navy & gold palette with serif typography, frame borders, and luxury narrative.',
        previewThumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        render: renderLuxuryEstate,
    },
    {
        id: 'family-home',
        name: 'Suburban Feature Sheet',
        category: 'Suburban',
        description: 'Warm, approachable layout tailored for single-family homes, gardens, and family amenities.',
        previewThumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
        render: renderFamilyHome,
    },
    {
        id: 'urban-showcase',
        name: 'Urban High-Rise Showcase',
        category: 'Urban',
        description: 'High-contrast architectural layout for luxury condominiums, penthouses, and skyline properties.',
        previewThumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
        render: renderUrbanShowcase,
    },
];

export function getTemplateById(id: string): TemplateDefinition {
    return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
