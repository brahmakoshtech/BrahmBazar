'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

export function useContent(section) {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // If section is provided, filter by it
                const url = section ? `/api/content?section=${section}` : '/api/content';
                const { data } = await api.get(url);

                // Transform array to key-value map: { 'navbar_announcement': 'Awaken Your Inner Energy' }
                const contentMap = data.reduce((acc, block) => {
                    acc[block.identifier] = block.content;
                    return acc;
                }, {});

                setContent(contentMap);
            } catch (error) {
                console.error('Failed to fetch content blocks', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [section]);

    // Helper to safely get content with fallback
    const getContent = useCallback((identifier, fallback = '') => {
        return content[identifier] || fallback;
    }, [content]);

    return { content, loading, getContent };
}
