import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Example NavLogo component for demonstration
const NavLogo = ({ logoUrl, logoSize, alt }: { logoUrl: string; logoSize: string | number; alt: string }) => (
  <img src={logoUrl} alt={alt} style={{ height: logoSize, width: 'auto', background: 'transparent' }} />
);

describe('NavLogo', () => {
  it('renders logo with correct src, alt, and size', () => {
    const { getByAltText } = render(
      <NavLogo logoUrl="/assets/monarchNav.png" logoSize={40} alt="MonarchNav Logo" />
    );
    const img = getByAltText('MonarchNav Logo') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/assets/monarchNav.png');
    expect(img.alt).toBe('MonarchNav Logo');
    expect(img.style.height).toBe('40px');
  });
});
