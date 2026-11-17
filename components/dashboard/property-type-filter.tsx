'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PropertyTypeFilter({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <select
            defaultValue={defaultValue}
            onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value === 'all') params.delete('type');
                else params.set('type', e.target.value);
                router.push(`/properties?${params.toString()}`);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-700"
        >
            <option value="all">All Property Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
        </select>
    );
}
