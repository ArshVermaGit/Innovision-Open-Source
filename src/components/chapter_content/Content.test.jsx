import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Content from './Content';
import React from 'react';

// Mock the context used by MarkDown component
vi.mock('@/contexts/nightMode', () => ({
  useNightMode: () => ({ nightMode: false }),
}));

describe('Content Component XSS Prevention', () => {
  it('should not render script tags from malicious payload', () => {
    const maliciousTopic = {
      title: 'Test Topic',
      content: [
        {
          type: 'para',
          content: '<script>alert("XSS")</script>This is safe text.',
        },
      ],
    };

    const { container } = render(<Content currentTopic={maliciousTopic} />);
    
    // Check that no script tag was rendered
    const scriptTags = container.querySelectorAll('script');
    expect(scriptTags.length).toBe(0);
    
    // Verify the text content is still rendered
    expect(container.textContent).toContain('This is safe text.');
  });
  
  it('should prevent XSS via image onerror attributes', () => {
    const maliciousTopic = {
      title: 'Test Topic',
      content: [
        {
          type: 'para',
          content: '<img src="x" onerror="alert(\'XSS\')" />',
        },
      ],
    };

    const { container } = render(<Content currentTopic={maliciousTopic} />);
    
    // react-markdown escapes HTML tags by default, so it renders as text
    // We can verify that no img tag was actually created in the DOM
    const imgTags = container.querySelectorAll('img');
    expect(imgTags.length).toBe(0);
  });
});
